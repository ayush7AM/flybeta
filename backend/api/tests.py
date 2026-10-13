import importlib
from datetime import timedelta
from unittest.mock import patch

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import StudentProfile
from learn.models import CapstoneSubmission, DailyActivity, Domain, Level, Lesson, LevelProgress, DomainProgress
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

    def test_first_pass_completes_track_with_reward_and_certificate(self):
        xp_before = self.user.profile.xp
        response = self.submit()
        reward = response.data['reward']
        self.assertEqual((reward['xp'], reward['coins'], reward['first_completion']), (500, 100, True))
        self.assertEqual(response.data['user']['xp'], xp_before + 500)

        progress = DomainProgress.objects.get(user=self.user, domain=self.domain)
        self.assertIsNotNone(progress.completed_at)
        self.assertEqual(str(progress.certificate_id), reward['certificate_id'])
        self.assertEqual(DailyActivity.objects.get(user=self.user).capstones_passed, 1)

        # Passing again keeps the same certificate and gives no second reward
        again = self.submit().data['reward']
        self.assertEqual((again['xp'], again['first_completion']), (0, False))
        self.assertEqual(again['certificate_id'], reward['certificate_id'])

    def test_failing_grade_gives_no_reward(self):
        self.evaluate.return_value = {'score': 40, 'passed': False, 'feedback': 'Keep going'}
        response = self.submit()
        self.assertIsNone(response.data['reward'])
        self.assertIsNone(DomainProgress.objects.get(user=self.user, domain=self.domain).completed_at)

    def test_certificate_is_publicly_verifiable(self):
        certificate_id = self.submit().data['reward']['certificate_id']
        self.client.force_authenticate(None)

        data = self.client.get(f'/api/v1/certificates/{certificate_id}/').data
        self.assertEqual((data['name'], data['track_title'], data['score']), ('Learner', 'Cloud', 82))
        self.assertEqual(
            self.client.get('/api/v1/certificates/00000000-0000-0000-0000-000000000000/').status_code, 404,
        )

    def test_submissions_are_rate_limited(self):
        for _ in range(10):
            self.assertEqual(self.submit().status_code, 201)
        self.assertEqual(self.submit().status_code, 429)
        self.assertEqual(self.client.get('/api/v1/capstone/').status_code, 200)


class StreakAndActivityTests(APITestCase):
    def setUp(self):
        self.domain = Domain.objects.create(name='cloud', title='Cloud')
        self.level = Level.objects.create(domain=self.domain, number=1, title='L1')
        self.quiz_level = Level.objects.create(domain=self.domain, number=2, title='L2', quiz_data=QUIZ)
        Level.objects.create(domain=self.domain, number=3, title='L3')
        self.lessons = [
            Lesson.objects.create(level=self.level, order=i, title=f'1.{i}', xp_reward=10) for i in (1, 2)
        ]
        self.user = User.objects.create_user(
            username='learner', email='learner@example.test', name='Learner', password='pw-for-tests-1',
        )
        self.client.force_authenticate(self.user)
        self.today = timezone.localdate()

    def profile(self):
        return User.objects.get(pk=self.user.pk).profile

    def set_streak(self, **fields):
        StudentProfile.objects.filter(user=self.user).update(**fields)
        self.client.force_authenticate(User.objects.get(pk=self.user.pk))  # drop the cached profile

    def complete(self, lesson):
        return self.client.post(f'/api/v1/lessons/{lesson.id}/complete/')

    def test_lesson_completion_logs_activity_and_starts_streak(self):
        self.complete(self.lessons[0])
        self.complete(self.lessons[1])
        self.complete(self.lessons[1])  # repeat — no double count

        activity = DailyActivity.objects.get(user=self.user, date=self.today)
        self.assertEqual((activity.lessons_completed, activity.xp_earned), (2, 20))
        self.assertEqual((self.profile().streak, self.profile().best_streak), (1, 1))

    def test_streak_extends_from_yesterday(self):
        self.set_streak(streak=3, best_streak=3, last_active_date=self.today - timedelta(days=1))
        response = self.complete(self.lessons[0])
        self.assertEqual(response.data['user']['streak'], 4)
        self.assertEqual(response.data['user']['best_streak'], 4)

    def test_missed_day_reads_as_broken_streak(self):
        self.set_streak(streak=5, best_streak=7, last_active_date=self.today - timedelta(days=3))
        profile = self.client.get('/api/v1/users/profile/').data
        self.assertEqual(profile['streak'], 0)
        self.assertEqual(profile['best_streak'], 7)

        response = self.complete(self.lessons[0])
        self.assertEqual(response.data['user']['streak'], 1)
        self.assertEqual(response.data['user']['best_streak'], 7)

    def test_quiz_pass_logs_activity(self):
        DomainProgress.objects.create(user=self.user, domain=self.domain, highest_unlocked_level=2)
        self.client.post(f'/api/v1/levels/{self.quiz_level.id}/pass_quiz/', {'answers': [1, 2]}, format='json')
        activity = DailyActivity.objects.get(user=self.user, date=self.today)
        self.assertEqual((activity.quizzes_passed, activity.xp_earned), (1, 50))

    def test_activity_endpoint(self):
        DailyActivity.objects.create(user=self.user, date=self.today, lessons_completed=2, xp_earned=25)
        DailyActivity.objects.create(user=self.user, date=self.today - timedelta(days=10), quizzes_passed=1)
        DailyActivity.objects.create(user=self.user, date=self.today - timedelta(days=400), lessons_completed=1)

        data = self.client.get('/api/v1/users/activity/?days=30').data
        self.assertEqual([d['count'] for d in data['days']], [1, 2])
        self.assertEqual(data['days'][-1]['xp'], 25)
        self.assertEqual(data['total_active_days'], 3)

        self.assertEqual(len(self.client.get('/api/v1/users/activity/?days=bogus').data['days']), 2)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get('/api/v1/users/activity/').status_code, 401)


class DomainListTests(APITestCase):
    def test_list_omits_lesson_bodies_but_detail_keeps_them(self):
        domain = Domain.objects.create(name='cloud', title='Cloud')
        level = Level.objects.create(domain=domain, number=1, title='L1', quiz_data=QUIZ)
        Lesson.objects.create(level=level, order=1, title='Intro', content_md='# Long lesson body')

        listed = self.client.get('/api/v1/domains/').data['results'][0]
        self.assertEqual(listed['levels'][0]['lessons'][0]['title'], 'Intro')
        self.assertNotIn('content_md', listed['levels'][0]['lessons'][0])
        self.assertNotIn('quiz_data', listed['levels'][0])

        detail = self.client.get('/api/v1/domains/cloud/').data
        self.assertEqual(detail['levels'][0]['lessons'][0]['content_md'], '# Long lesson body')


class StreakRestoreTests(APITestCase):
    URL = '/api/v1/users/streak/restore/'

    def setUp(self):
        self.domain = Domain.objects.create(name='cloud', title='Cloud')
        level = Level.objects.create(domain=self.domain, number=1, title='L1')
        Level.objects.create(domain=self.domain, number=2, title='L2')
        self.lesson = Lesson.objects.create(level=level, order=1, title='1.1')
        self.user = User.objects.create_user(
            username='learner', email='learner@example.test', name='Learner', password='pw-for-tests-1',
        )
        self.today = timezone.localdate()
        self.client.force_authenticate(self.user)

    def set_profile(self, **fields):
        StudentProfile.objects.filter(user=self.user).update(**fields)
        self.client.force_authenticate(User.objects.get(pk=self.user.pk))  # drop the cached profile

    def days_ago(self, n):
        return self.today - timedelta(days=n)

    def offer(self):
        return self.client.get('/api/v1/users/profile/').data['streak_restore']

    def test_no_offer_while_streak_is_alive(self):
        self.set_profile(streak=4, last_active_date=self.days_ago(1), coins=500)
        self.assertIsNone(self.offer())
        self.assertEqual(self.client.post(self.URL).status_code, 400)

    def test_restore_after_missing_days_without_coming_back(self):
        # Active up to 3 days ago; missed the 2 days in between
        self.set_profile(streak=10, best_streak=10, last_active_date=self.days_ago(3), coins=150)
        offer = self.offer()
        self.assertEqual((offer['lost_streak'], offer['missed_days'], offer['cost']), (10, 2, 100))
        self.assertEqual(offer['restored_streak'], 12)

        response = self.client.post(self.URL)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['streak'], 12)
        self.assertEqual(response.data['user']['coins'], 50)
        self.assertEqual(response.data['user']['best_streak'], 12)
        self.assertIsNone(response.data['user']['streak_restore'])

        # Today's lesson extends the restored streak instead of restarting it
        self.client.force_authenticate(User.objects.get(pk=self.user.pk))
        completed = self.client.post(f'/api/v1/lessons/{self.lesson.id}/complete/')
        self.assertEqual(completed.data['user']['streak'], 13)

    def test_restore_joins_old_and_new_streaks(self):
        # Old 5-day streak ended 4 days ago, missed one day, then a new 2-day streak through yesterday
        self.set_profile(
            streak=2, last_active_date=self.days_ago(1),
            broken_streak=5, broken_streak_last_day=self.days_ago(4), coins=60,
        )
        offer = self.offer()
        self.assertEqual((offer['missed_days'], offer['cost'], offer['restored_streak']), (1, 50, 8))

        self.assertEqual(self.client.post(self.URL).data['user']['streak'], 8)

    def test_breaking_a_streak_through_activity_keeps_it_restorable(self):
        self.set_profile(streak=6, best_streak=6, last_active_date=self.days_ago(2), coins=100)
        completed = self.client.post(f'/api/v1/lessons/{self.lesson.id}/complete/')
        self.assertEqual(completed.data['user']['streak'], 1)

        offer = completed.data['user']['streak_restore']
        self.assertEqual((offer['lost_streak'], offer['missed_days'], offer['restored_streak']), (6, 1, 8))

    def test_too_many_missed_days_cannot_be_restored(self):
        self.set_profile(streak=20, last_active_date=self.days_ago(4), coins=1000)  # 3 missed days
        self.assertIsNone(self.offer())

    def test_not_enough_coins(self):
        self.set_profile(streak=10, last_active_date=self.days_ago(2), coins=30)
        self.assertFalse(self.offer()['can_afford'])

        response = self.client.post(self.URL)
        self.assertEqual(response.status_code, 400)
        self.assertIn('50 coins', response.data['error'])
        self.assertEqual(StudentProfile.objects.get(user=self.user).coins, 30)
