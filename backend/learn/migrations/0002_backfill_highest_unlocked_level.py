from django.db import migrations


def backfill_highest_unlocked_level(apps, schema_editor):
    """
    Lesson completion used to never advance highest_unlocked_level, leaving
    users who finished quiz-less levels stuck at Level 1. Recompute each
    user's frontier from their completed levels, never lowering it.
    """
    Level = apps.get_model('learn', 'Level')
    LevelProgress = apps.get_model('learn', 'LevelProgress')
    DomainProgress = apps.get_model('learn', 'DomainProgress')

    levels_by_domain = {}
    for level in Level.objects.order_by('number'):
        levels_by_domain.setdefault(level.domain_id, []).append(level)

    completed = set(
        LevelProgress.objects.filter(is_completed=True).values_list('user_id', 'level_id')
    )
    user_domains = set(
        LevelProgress.objects.values_list('user_id', 'level__domain_id')
    )

    for user_id, domain_id in user_domains:
        progress, _ = DomainProgress.objects.get_or_create(user_id=user_id, domain_id=domain_id)
        highest = progress.highest_unlocked_level

        # The final level has nothing after it to unlock
        for level in levels_by_domain.get(domain_id, [])[:-1]:
            if level.number < highest:
                continue
            # Quiz levels unlock only by passing the quiz, which we can't infer
            if level.number > highest or level.quiz_data or (user_id, level.id) not in completed:
                break
            highest = level.number + 1

        if highest != progress.highest_unlocked_level:
            progress.highest_unlocked_level = highest
            progress.current_level = highest
            progress.save(update_fields=['highest_unlocked_level', 'current_level'])


class Migration(migrations.Migration):

    dependencies = [
        ('learn', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(backfill_highest_unlocked_level, migrations.RunPython.noop),
    ]
