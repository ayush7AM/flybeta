"""
Management command: load_level_content

Reads JSON curriculum files from backend/content/{domain}/level_{NN}.json
and syncs the Domain, Level, and Lesson models to match them.

Existing rows are updated in place (matched by domain slug, level number and
lesson order), so user progress attached to them survives a reload. Levels and
lessons that no longer appear in the files are removed; a domain whose folder
is gone is unpublished rather than deleted, keeping its learners' history.

The whole load runs in one transaction: if any file fails, nothing is written.

Usage:
    python manage.py load_level_content
    python manage.py load_level_content --domain cloud
    python manage.py load_level_content --dry-run

JSON Schema (per file):
{
  "domain": {
    "name": "cloud",              # slug, unique identifier
    "title": "Cloud Computing",   # display title
    "icon": "cloud",              # Material Symbol name or emoji
    "color": "#2563EB"            # track accent hex
  },
  "level": {
    "number": 1,                  # 1-10
    "title": "Cloud Foundations",
    "description": "Intro to cloud computing concepts."
  },
  "lessons": [
    {
      "order": 1,
      "title": "What is Cloud Computing?",
      "content_md": "# What is Cloud Computing?\\n\\n...",
      "xp_reward": 10,
      "coins_reward": 5,
      "is_mandatory": true,
      "illustration_url": "https://example.com/cloud.png"
    }
  ]
}
"""

import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from learn.models import Domain, Level, Lesson


class Command(BaseCommand):
    help = (
        'Sync curriculum from JSON files in content/{domain}/level_{NN}.json '
        'into Domain, Level, and Lesson models, preserving user progress.'
    )

    # Map domain slugs → track_code and is_published
    DOMAIN_META = {
        'ai': {'track_code': 'TS-01', 'is_published': True},
        'cloud': {'track_code': 'TS-02', 'is_published': True},
        'data': {'track_code': 'TS-03', 'is_published': True},
    }

    def add_arguments(self, parser):
        parser.add_argument(
            '--domain',
            type=str,
            default=None,
            help='Only load content for a specific domain folder name (e.g. "cloud").',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the full sync and report the changes, then roll them back.',
        )

    def handle(self, *args, **options):
        content_dir = Path(settings.BASE_DIR) / 'content'
        domain_filter = options['domain']
        dry_run = options['dry_run']

        if not content_dir.is_dir():
            raise CommandError(f'Content directory not found: {content_dir}')

        # Windows consoles default to cp1252 — an emoji in a lesson title
        # must not crash the load halfway through.
        for stream in (self.stdout, self.stderr):
            if hasattr(stream, 'reconfigure'):
                stream.reconfigure(errors='replace')

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - all changes will be rolled back.'))

        # Counters
        stats = {
            'domains_created': 0, 'domains_updated': 0, 'domains_unpublished': 0,
            'levels_created': 0, 'levels_updated': 0, 'levels_removed': 0,
            'lessons_created': 0, 'lessons_updated': 0, 'lessons_removed': 0,
            'files_processed': 0, 'errors': 0,
        }

        # Everything the files define — rows outside this set get pruned
        seen = {
            'domains': set(),  # domain slugs
            'levels': {},      # domain pk → level numbers
            'lessons': {},     # level pk → lesson orders
        }

        with transaction.atomic():
            # Iterate domain folders: content/{domain}/
            domain_dirs = sorted(content_dir.iterdir())
            for domain_path in domain_dirs:
                if not domain_path.is_dir():
                    continue
                if domain_filter and domain_path.name != domain_filter:
                    continue

                # Iterate level files: content/{domain}/level_*.json
                level_files = sorted(domain_path.glob('level_*.json'))
                if not level_files:
                    self.stdout.write(
                        self.style.WARNING(f'  No level_*.json files in {domain_path.name}/')
                    )
                    continue

                for level_file in level_files:
                    try:
                        # Savepoint, so one bad file doesn't poison the outer transaction
                        with transaction.atomic():
                            self._process_file(level_file, stats, seen)
                    except Exception as e:
                        stats['errors'] += 1
                        self.stderr.write(
                            self.style.ERROR(f'  ERROR processing {level_file}: {e}')
                        )

            # An empty sync would unpublish every domain — treat it as a mistake
            if not stats['files_processed'] and not stats['errors']:
                target = f'content/{domain_filter}/' if domain_filter else 'content/'
                raise CommandError(f'No level_*.json files found in {target} - nothing to load.')

            # Only prune when every file loaded — a failed file must not look "removed"
            if not stats['errors']:
                self._prune(seen, stats, unpublish_missing_domains=domain_filter is None)

            if dry_run or stats['errors']:
                transaction.set_rollback(True)

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        if stats['errors']:
            self.stdout.write(self.style.ERROR('LOAD FAILED - ROLLED BACK'))
        elif dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETE - ROLLED BACK'))
        else:
            self.stdout.write(self.style.SUCCESS('LOAD COMPLETE'))
        self.stdout.write(f'  Files processed     : {stats["files_processed"]}')
        self.stdout.write(f'  Domains created     : {stats["domains_created"]}')
        self.stdout.write(f'  Domains updated     : {stats["domains_updated"]}')
        self.stdout.write(f'  Domains unpublished : {stats["domains_unpublished"]}')
        self.stdout.write(f'  Levels created      : {stats["levels_created"]}')
        self.stdout.write(f'  Levels updated      : {stats["levels_updated"]}')
        self.stdout.write(f'  Levels removed      : {stats["levels_removed"]}')
        self.stdout.write(f'  Lessons created     : {stats["lessons_created"]}')
        self.stdout.write(f'  Lessons updated     : {stats["lessons_updated"]}')
        self.stdout.write(f'  Lessons removed     : {stats["lessons_removed"]}')
        if stats['errors']:
            self.stdout.write(self.style.ERROR(f'  Errors              : {stats["errors"]}'))
        self.stdout.write(self.style.SUCCESS('=' * 50))

        if stats['errors']:
            raise CommandError(
                f'{stats["errors"]} file(s) failed to load - no changes were written.'
            )

    def _process_file(self, filepath: Path, stats: dict, seen: dict):
        """Parse a single level JSON file and upsert Domain, Level, Lessons."""
        self.stdout.write(f'  Processing: {filepath.relative_to(filepath.parent.parent)}')

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # --- Validate required keys ---
        for key in ('domain', 'level', 'lessons'):
            if key not in data:
                raise ValueError(f'Missing required top-level key: "{key}"')

        domain_data = data['domain']
        level_data = data['level']
        lessons_data = data['lessons']

        if not isinstance(lessons_data, list):
            raise ValueError('"lessons" must be an array.')

        # --- Domain ---
        domain_slug = domain_data['name']
        meta = self.DOMAIN_META.get(domain_slug, {})

        domain, created = Domain.objects.update_or_create(
            name=domain_slug,
            defaults={
                'title': domain_data.get('title', domain_slug.replace('-', ' ').title()),
                'icon': domain_data.get('icon', ''),
                'color': domain_data.get('color', ''),
                'track_code': meta.get('track_code', ''),
                'is_published': meta.get('is_published', True),
                'character_image': domain_data.get('character_image', ''),
            },
        )
        if created:
            stats['domains_created'] += 1
            self.stdout.write(self.style.SUCCESS(f'    + Domain created: {domain.title}'))
        else:
            stats['domains_updated'] += 1
            self.stdout.write(f'    ~ Domain updated: {domain.title}')

        # --- Level ---
        level, created = Level.objects.update_or_create(
            domain=domain,
            number=level_data['number'],
            defaults={
                'title': level_data.get('title', f'Level {level_data["number"]}'),
                'description': level_data.get('description', ''),
                'quiz_data': level_data.get('quiz_data', None),
            },
        )
        if created:
            stats['levels_created'] += 1
            self.stdout.write(self.style.SUCCESS(f'    + Level created: {level}'))
        else:
            stats['levels_updated'] += 1
            self.stdout.write(f'    ~ Level updated: {level}')

        # --- Lessons ---
        lesson_orders = set()
        for lesson_data in lessons_data:
            # Support both 'content_md' and 'content' keys from JSON
            content = lesson_data.get('content_md', lesson_data.get('content', ''))

            lesson, created = Lesson.objects.update_or_create(
                level=level,
                order=lesson_data['order'],
                defaults={
                    'title': lesson_data.get('title', f'Lesson {lesson_data["order"]}'),
                    'content_md': content,
                    'xp_reward': lesson_data.get('xp_reward', 10),
                    'coins_reward': lesson_data.get('coins_reward', 5),
                    'is_mandatory': lesson_data.get('is_mandatory', True),
                    'illustration_url': lesson_data.get('illustration_url', ''),
                    'lesson_type': lesson_data.get('lesson_type', 'theory'),
                },
            )
            lesson_orders.add(lesson.order)
            if created:
                stats['lessons_created'] += 1
                self.stdout.write(self.style.SUCCESS(f'      + Lesson created: {lesson}'))
            else:
                stats['lessons_updated'] += 1
                self.stdout.write(f'      ~ Lesson updated: {lesson}')

        # Record only after the whole file succeeded
        seen['domains'].add(domain.name)
        seen['levels'].setdefault(domain.pk, set()).add(level.number)
        seen['lessons'][level.pk] = lesson_orders

        stats['files_processed'] += 1

    def _prune(self, seen: dict, stats: dict, unpublish_missing_domains: bool):
        """Remove levels/lessons dropped from the files and unpublish vanished domains."""
        for level_pk, orders in seen['lessons'].items():
            for lesson in Lesson.objects.filter(level_id=level_pk).exclude(order__in=orders):
                self.stdout.write(self.style.WARNING(f'  - Lesson removed: {lesson}'))
                lesson.delete()
                stats['lessons_removed'] += 1

        for domain_pk, numbers in seen['levels'].items():
            for level in Level.objects.filter(domain_id=domain_pk).exclude(number__in=numbers):
                self.stdout.write(self.style.WARNING(f'  - Level removed: {level}'))
                level.delete()
                stats['levels_removed'] += 1

        # Deleting a domain would cascade to every learner's progress and
        # capstone submissions — hide it instead.
        if unpublish_missing_domains:
            missing = Domain.objects.filter(is_published=True).exclude(name__in=seen['domains'])
            for domain in missing:
                self.stdout.write(self.style.WARNING(f'  - Domain unpublished: {domain.title}'))
            stats['domains_unpublished'] = missing.update(is_published=False)
