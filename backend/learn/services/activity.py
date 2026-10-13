"""
Learning activity bookkeeping — streaks and the per-day activity log.
"""
from django.db.models import F
from django.utils import timezone

from learn.models import DailyActivity


def record_activity(profile, *, lessons=0, quizzes=0, capstones=0, xp=0):
    """
    Count an activity for today: update the profile's streak (caller saves the
    profile) and add to today's DailyActivity row. Call inside a transaction.
    """
    today = timezone.localdate()
    profile.register_activity_day(today)

    activity, _ = DailyActivity.objects.get_or_create(user=profile.user, date=today)
    DailyActivity.objects.filter(pk=activity.pk).update(
        lessons_completed=F('lessons_completed') + lessons,
        quizzes_passed=F('quizzes_passed') + quizzes,
        capstones_passed=F('capstones_passed') + capstones,
        xp_earned=F('xp_earned') + xp,
    )
