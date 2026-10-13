import importlib
from unittest.mock import patch

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

from learn.models import CapstoneSubmission, Domain, Level, Lesson, LevelProgress, DomainProgress
from learn.services.ai_evaluator import EvaluationError
from learn.services.github_service import RepoFetchError

User = get_user_model()

QUIZ = [
    {'question': 'Q1', 'options': ['a', 'b', 'c', 'd'], 'correct_index': 1},
    {'question': 'Q2', 'options': ['a', 'b', 'c', 'd'], 'correct_index': 2},
]


class LevelProgressionTests(APITestCase):
    """
    Track layout: Level 1 (2 lessons, no quiz) → Level 2 (1 lesson, boss quiz) → Level 3.
    """

    def setUp(self):
        self.domain = Domain.objects.create(name='cloud', title='Cloud')
        self.level1 = Level.objects.create(domain=self.domain, number=1, title='L1')
        self.level2 = Level.objects.create(domain=self.domain, number=2, title='L2', quiz_data=QUIZ)
        self.level3 = Level.objects.create(domain=self.domain, number=3, title='L3')
        self.l1_lessons = [
            Lesson.objects.create(level=self.level1, order=1, title='1.1'),
            Lesson.objects.create(level=self.level1, order=2, title='1.2'),
        ]
        self.l2_lesson = Lesson.objects.create(level=self.level2, order=1, title='2.1')
        self.l3_lesson = Lesson.objects.create(level=self.level3, order=1, title='3.1')

        self.user = User.objects.create_user(
            username='learner', email='learner@example.test', name='Learner', password='pw-for-tests-1',
        )
        self.client.force_authenticate(self.user)

    def highest_unlocked(self):
        progress = DomainProgress.objects.filter(user=self.user, domain=self.domain).first()
        return progress.highest_unlocked_level if progress else 1

    def complete(self, lesson):
        return self.client.post(f'/api/v1/lessons/{lesson.id}/complete/')

    def submit_quiz(self, level, answers):
        return self.client.post(f'/api/v1/levels/{level.id}/pass_quiz/', {'answers': answers}, format='json')

    def unlock_level2(self):
        for lesson in self.l1_lessons:
            self.complete(lesson)

    # ── Lesson completion ────────────────────────────────────────────────

    def test_completing_quizless_level_unlocks_next_level(self):
        first = self.complete(self.l1_lessons[0])
        self.assertFalse(first.data['next_level_unlocked'])
        self.assertEqual(self.highest_unlocked(), 1)

        last = self.complete(self.l1_lessons[1])
        self.assertTrue(last.data['level_completed'])
        self.assertTrue(last.data['next_level_unlocked'])
        self.assertEqual(self.highest_unlocked(), 2)
        self.assertEqual(last.data['user']['domain_progress'][0]['highest_unlocked_level'], 2)

    def test_completing_quiz_level_lessons_does_not_unlock(self):
        self.unlock_level2()
        response = self.complete(self.l2_lesson)
        self.assertTrue(response.data['level_completed'])
        self.assertFalse(response.data['next_level_unlocked'])
        self.assertEqual(self.highest_unlocked(), 2)

    def test_cannot_complete_lesson_in_locked_level(self):
        response = self.complete(self.l3_lesson)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(self.user.profile.xp, 0)

    # ── Boss quiz ────────────────────────────────────────────────────────

    def test_quiz_answers_are_not_exposed(self):
        response = self.client.get(f'/api/v1/levels/{self.level2.id}/')
        self.assertEqual(response.data['quiz_data'][0]['options'], ['a', 'b', 'c', 'd'])
        self.assertNotIn('correct_index', response.data['quiz_data'][0])

    def test_failing_quiz_does_not_unlock(self):
        self.unlock_level2()
        response = self.submit_quiz(self.level2, [0, 0])
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['passed'])
        self.assertEqual(response.data['score'], 0)
        self.assertEqual(self.highest_unlocked(), 2)

    def test_passing_quiz_unlocks_next_level_once(self):
        self.unlock_level2()
        xp_before = User.objects.get(pk=self.user.pk).profile.xp

        response = self.submit_quiz(self.level2, [1, 2])
        self.assertTrue(response.data['passed'])
        self.assertTrue(response.data['level_unlocked'])
        self.assertEqual(self.highest_unlocked(), 3)
        self.assertEqual(response.data['user']['xp'], xp_before + 50)

        repeat = self.submit_quiz(self.level2, [1, 2])
        self.assertTrue(repeat.data['passed'])
        self.assertFalse(repeat.data['level_unlocked'])
        self.assertEqual(repeat.data['user']['xp'], xp_before + 50)

    def test_cannot_take_quiz_on_locked_level(self):
        response = self.submit_quiz(self.level2, [1, 2])
        self.assertEqual(response.status_code, 403)
        self.assertEqual(self.highest_unlocked(), 1)

    def test_quiz_rejects_wrong_answer_count(self):
        self.unlock_level2()
        self.assertEqual(self.submit_quiz(self.level2, [1]).status_code, 400)
        self.assertEqual(self.client.post(f'/api/v1/levels/{self.level2.id}/pass_quiz/').status_code, 400)

    def test_quiz_requires_authentication(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.submit_quiz(self.level2, [1, 2]).status_code, 401)

    def test_final_level_does_not_unlock_past_end(self):
        DomainProgress.objects.create(user=self.user, domain=self.domain, highest_unlocked_level=3)
        response = self.complete(self.l3_lesson)
        self.assertTrue(response.data['level_completed'])
        self.assertFalse(response.data['next_level_unlocked'])
        self.assertEqual(self.highest_unlocked(), 3)

    # ── Backfill migration ───────────────────────────────────────────────

    def test_backfill_unlocks_completed_quizless_levels(self):
        progress = LevelProgress.objects.create(user=self.user, level=self.level1, is_completed=True)
        progress.lessons_completed.set(self.l1_lessons)
        LevelProgress.objects.create(user=self.user, level=self.level2, is_completed=True)

        migration = importlib.import_module('learn.migrations.0002_backfill_highest_unlocked_level')
        migration.backfill_highest_unlocked_level(apps, None)

        # Level 1 done → Level 2 unlocked; Level 2's quiz can't be inferred, so it stops there
        self.assertEqual(self.highest_unlocked(), 2)


class CapstoneSubmissionTests(APITestCase):
    """Track with 2 levels, so Level 2 is the capstone level."""

    def setUp(self):
        cache.clear()  # throttle history
        self.domain = Domain.objects.create(name='cloud', title='Cloud')
        Level.objects.create(domain=self.domain, number=1, title='L1')
        Level.objects.create(domain=self.domain, number=2, title='Capstone')

        self.user = User.objects.create_user(
            username='learner', email='learner@example.test', name='Learner', password='pw-for-tests-1',
        )
        self.other = User.objects.create_user(
            username='other', email='other@example.test', name='Other', password='pw-for-tests-2',
        )
        for user in (self.user, self.other):
            DomainProgress.objects.create(user=user, domain=self.domain, highest_unlocked_level=2)
        self.client.force_authenticate(self.user)

        fetch = patch('api.views.fetch_github_repo_content', return_value='print("hi")')
        evaluate = patch('api.views.evaluate_code', return_value={'score': 82, 'passed': True, 'feedback': '**Nice**'})
        self.fetch = fetch.start()
        self.evaluate = evaluate.start()
        self.addCleanup(patch.stopall)

    def submit(self, url='https://github.com/learner/project'):
        return self.client.post('/api/v1/capstone/', {'domain': self.domain.id, 'github_url': url}, format='json')

    def test_successful_submission_is_graded(self):
        response = self.submit('https://github.com/learner/project.git')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'graded')
        self.assertEqual(response.data['score'], 82)
        self.assertTrue(response.data['passed'])
        self.assertEqual(response.data['github_url'], 'https://github.com/learner/project')
        self.evaluate.assert_called_once_with('Cloud', 'print("hi")')

    def test_requires_final_level(self):
        DomainProgress.objects.filter(user=self.user).update(highest_unlocked_level=1)
        response = self.submit()
        self.assertEqual(response.status_code, 403)
        self.fetch.assert_not_called()
        self.assertFalse(CapstoneSubmission.objects.exists())

    def test_rejects_non_github_url(self):
        for url in ('https://gitlab.com/a/b', 'https://evil.test/github.com/a/b', 'not a url'):
            self.assertEqual(self.submit(url).status_code, 400, url)
        self.fetch.assert_not_called()

    def test_repo_problem_returns_400_with_reason(self):
        self.fetch.side_effect = RepoFetchError('Repository not found. Make sure it exists and is public.')
        response = self.submit()
        self.assertEqual(response.status_code, 400)
        self.assertIn('not found', response.data['error'])
        self.assertEqual(CapstoneSubmission.objects.get().status, 'failed')

    def test_service_failure_is_not_a_failing_grade(self):
        self.evaluate.side_effect = EvaluationError('boom')
        with self.assertLogs('api.views', level='ERROR'):
            response = self.submit()
        self.assertEqual(response.status_code, 502)
        submission = CapstoneSubmission.objects.get()
        self.assertEqual(submission.status, 'failed')
        self.assertIsNone(submission.score)

    def test_users_only_see_their_own_submissions(self):
        theirs = CapstoneSubmission.objects.create(
            user=self.other, domain=self.domain, github_url='https://github.com/other/x', status='graded',
        )
        self.submit()

        listed = self.client.get('/api/v1/capstone/').data['results']
        self.assertEqual([s['username'] for s in listed], ['learner'])
        self.assertEqual(self.client.get(f'/api/v1/capstone/{theirs.id}/').status_code, 404)

    def test_submissions_are_immutable(self):
        mine = CapstoneSubmission.objects.create(
            user=self.user, domain=self.domain, github_url='https://github.com/learner/x', status='graded',
        )
        self.assertEqual(self.client.delete(f'/api/v1/capstone/{mine.id}/').status_code, 405)
        self.assertEqual(self.client.patch(f'/api/v1/capstone/{mine.id}/', {'score': 100}, format='json').status_code, 405)

    def test_submissions_are_rate_limited(self):
        for _ in range(10):
            self.assertEqual(self.submit().status_code, 201)
        self.assertEqual(self.submit().status_code, 429)
        self.assertEqual(self.client.get('/api/v1/capstone/').status_code, 200)
