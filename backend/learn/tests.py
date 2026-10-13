import json
import tempfile
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from learn.models import CapstoneSubmission, Domain, DomainProgress, Lesson, Level, LevelProgress
from learn.services.ai_evaluator import EvaluationError, evaluate_code
from learn.services.github_service import RepoFetchError, fetch_github_repo_content, parse_repo_url

User = get_user_model()


def level_file(domain, number, lessons, title=None):
    return {
        'domain': {'name': domain, 'title': domain.title()},
        'level': {'number': number, 'title': title or f'Level {number}'},
        'lessons': [{'order': order, 'title': lesson_title} for order, lesson_title in lessons],
    }


class LoadLevelContentTests(TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name)
        self.settings_override = override_settings(BASE_DIR=self.base)
        self.settings_override.enable()
        self.addCleanup(self.settings_override.disable)

        self.write('cloud', level_file('cloud', 1, [(1, 'Intro'), (2, 'Models')]))
        self.write('cloud', level_file('cloud', 2, [(1, 'Storage')]))
        self.write('ai', level_file('ai', 1, [(1, 'What is AI')]))
        self.load()

        self.user = User.objects.create_user(
            username='learner', email='learner@example.test', name='Learner', password='pw-for-tests-1',
        )
        self.cloud = Domain.objects.get(name='cloud')
        self.level1 = Level.objects.get(domain=self.cloud, number=1)
        self.intro = Lesson.objects.get(level=self.level1, order=1)

        progress = LevelProgress.objects.create(user=self.user, level=self.level1, is_completed=True)
        progress.lessons_completed.add(self.intro)
        DomainProgress.objects.create(user=self.user, domain=self.cloud, highest_unlocked_level=2)
        CapstoneSubmission.objects.create(user=self.user, domain=self.cloud, github_url='https://github.com/a/b')

    def write(self, domain, data):
        folder = self.base / 'content' / domain
        folder.mkdir(parents=True, exist_ok=True)
        (folder / f'level_{data["level"]["number"]:02d}.json').write_text(json.dumps(data), encoding='utf-8')

    def load(self, *args):
        call_command('load_level_content', *args, stdout=StringIO(), stderr=StringIO())

    def assert_progress_intact(self):
        self.assertTrue(LevelProgress.objects.filter(user=self.user, level=self.level1).exists())
        self.assertTrue(
            LevelProgress.objects.get(user=self.user, level=self.level1).lessons_completed.filter(pk=self.intro.pk).exists()
        )
        self.assertEqual(DomainProgress.objects.get(user=self.user, domain=self.cloud).highest_unlocked_level, 2)
        self.assertEqual(CapstoneSubmission.objects.filter(user=self.user).count(), 1)

    def test_reload_preserves_progress_and_updates_content(self):
        self.write('cloud', level_file('cloud', 1, [(1, 'Intro (revised)'), (2, 'Models')]))
        self.load()

        self.assert_progress_intact()
        self.intro.refresh_from_db()
        self.assertEqual(self.intro.title, 'Intro (revised)')

    def test_removed_lessons_and_levels_are_pruned(self):
        self.write('cloud', level_file('cloud', 1, [(1, 'Intro')]))
        (self.base / 'content' / 'cloud' / 'level_02.json').unlink()
        self.load()

        self.assertEqual(list(self.level1.lessons.values_list('order', flat=True)), [1])
        self.assertFalse(Level.objects.filter(domain=self.cloud, number=2).exists())
        self.assert_progress_intact()

    def test_missing_domain_is_unpublished_not_deleted(self):
        for path in (self.base / 'content' / 'cloud').iterdir():
            path.unlink()
        (self.base / 'content' / 'cloud').rmdir()
        self.load()

        self.cloud.refresh_from_db()
        self.assertFalse(self.cloud.is_published)
        self.assert_progress_intact()

        # Restoring the folder republishes the same domain
        self.write('cloud', level_file('cloud', 1, [(1, 'Intro'), (2, 'Models')]))
        self.write('cloud', level_file('cloud', 2, [(1, 'Storage')]))
        self.load()
        self.cloud.refresh_from_db()
        self.assertTrue(self.cloud.is_published)

    def test_domain_filter_leaves_other_domains_alone(self):
        (self.base / 'content' / 'ai' / 'level_01.json').unlink()
        self.write('ai', level_file('ai', 2, [(1, 'Neural nets')]))
        self.load('--domain', 'cloud')

        ai = Domain.objects.get(name='ai')
        self.assertTrue(ai.is_published)
        self.assertTrue(Level.objects.filter(domain=ai, number=1).exists())
        self.assertFalse(Level.objects.filter(domain=ai, number=2).exists())

    def test_bad_file_rolls_back_everything(self):
        self.write('cloud', level_file('cloud', 1, [(1, 'Changed')]))
        (self.base / 'content' / 'cloud' / 'level_02.json').write_text('{ not json', encoding='utf-8')

        with self.assertRaises(CommandError):
            self.load()

        self.intro.refresh_from_db()
        self.assertEqual(self.intro.title, 'Intro')
        self.assertEqual(self.level1.lessons.count(), 2)
        self.assertTrue(Level.objects.filter(domain=self.cloud, number=2).exists())

    def test_dry_run_writes_nothing(self):
        self.write('cloud', level_file('cloud', 1, [(1, 'Changed')]))
        self.load('--dry-run')

        self.intro.refresh_from_db()
        self.assertEqual(self.intro.title, 'Intro')
        self.assertEqual(self.level1.lessons.count(), 2)

    def test_empty_content_is_refused(self):
        for domain in ('cloud', 'ai'):
            for path in (self.base / 'content' / domain).iterdir():
                path.unlink()

        with self.assertRaises(CommandError):
            self.load()

        self.assertEqual(Domain.objects.filter(is_published=True).count(), 2)


class FakeResponse:
    def __init__(self, status_code=200, payload=None, text=''):
        self.status_code = status_code
        self._payload = payload
        self.text = text

    def json(self):
        return self._payload


class GitHubServiceTests(TestCase):
    def test_parse_repo_url(self):
        valid = {
            'https://github.com/owner/repo': ('owner', 'repo'),
            'https://github.com/owner/repo.git': ('owner', 'repo'),
            'https://www.github.com/owner/my.repo/': ('owner', 'my.repo'),
            'https://github.com/owner/repo/tree/main/src': ('owner', 'repo'),
        }
        for url, expected in valid.items():
            self.assertEqual(parse_repo_url(url), expected, url)

        for url in ('https://gitlab.com/a/b', 'https://evil.test/github.com/a/b',
                    'https://github.com/owner', 'https://github.com/owner/..', ''):
            with self.assertRaises(RepoFetchError, msg=url):
                parse_repo_url(url)

    @patch('learn.services.github_service.requests.get')
    def test_fetch_walks_tree_and_skips_noise(self, mock_get):
        tree = [
            {'path': 'README.md', 'type': 'blob', 'size': 100},
            {'path': 'src/app.py', 'type': 'blob', 'size': 100},
            {'path': 'analysis.ipynb', 'type': 'blob', 'size': 500_000},
            {'path': 'node_modules/lib/index.js', 'type': 'blob', 'size': 100},
            {'path': 'package-lock.json', 'type': 'blob', 'size': 100},
            {'path': 'data/huge.json', 'type': 'blob', 'size': 5_000_000},
            {'path': 'logo.png', 'type': 'blob', 'size': 100},
            {'path': 'src', 'type': 'tree'},
        ]
        notebook = json.dumps({'cells': [{'source': ['import pandas']}, {'source': ['df.head()'], 'outputs': ['x' * 1000]}]})
        files = {'README.md': '# Project', 'src/app.py': 'print(1)', 'analysis.ipynb': notebook}

        def fake_get(url, **kwargs):
            if 'api.github.com' in url:
                return FakeResponse(payload={'tree': tree})
            return FakeResponse(text=files[url.split('/HEAD/')[1]])

        mock_get.side_effect = fake_get
        content = fetch_github_repo_content('https://github.com/owner/repo')

        self.assertIn('FILE: README.md', content)
        self.assertIn('FILE: src/app.py', content)
        self.assertIn('import pandas\n\ndf.head()', content)
        self.assertNotIn('xxxx', content)
        for skipped in ('node_modules', 'package-lock', 'huge.json', 'logo.png'):
            self.assertNotIn(skipped, content)
        for call in mock_get.call_args_list:
            self.assertEqual(call.kwargs['timeout'], 10)

    @patch('learn.services.github_service.requests.get')
    def test_fetch_reports_student_fixable_problems(self, mock_get):
        cases = [
            (FakeResponse(404), 'not found'),
            (FakeResponse(409), 'empty'),
            (FakeResponse(payload={'tree': [{'path': 'logo.png', 'type': 'blob', 'size': 1}]}), 'No source files'),
        ]
        for response, message in cases:
            mock_get.return_value = response
            with self.assertRaisesRegex(RepoFetchError, message):
                fetch_github_repo_content('https://github.com/owner/repo')

    @patch('learn.services.github_service.requests.get', return_value=FakeResponse(403))
    def test_fetch_treats_rate_limit_as_service_error(self, mock_get):
        with self.assertRaises(RuntimeError):
            fetch_github_repo_content('https://github.com/owner/repo')


@override_settings(GEMINI_API_KEY='test-key')
class AIEvaluatorTests(TestCase):
    def grade_with(self, response_text):
        with patch('learn.services.ai_evaluator.genai.Client') as client:
            client.return_value.models.generate_content.return_value.text = response_text
            return evaluate_code('Cloud', 'print(1)')

    def test_pass_is_derived_from_score(self):
        self.assertEqual(
            self.grade_with('{"score": 75, "feedback": "Good"}'),
            {'score': 75, 'passed': True, 'feedback': 'Good'},
        )
        self.assertFalse(self.grade_with('{"score": 59, "feedback": "Close"}')['passed'])

    def test_score_is_clamped(self):
        self.assertEqual(self.grade_with('{"score": 140, "feedback": "x"}')['score'], 100)
        self.assertEqual(self.grade_with('{"score": -5, "feedback": "x"}')['score'], 0)

    def test_bad_ai_output_raises(self):
        with self.assertRaises(EvaluationError):
            self.grade_with('not json')

    @override_settings(GEMINI_API_KEY='')
    def test_missing_api_key_raises(self):
        with self.assertRaises(EvaluationError):
            evaluate_code('Cloud', 'print(1)')
