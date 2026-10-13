from datetime import timedelta

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Adds a required 'name' field and enforces unique email.
    """
    name = models.CharField(max_length=150, help_text='Full display name')
    email = models.EmailField(unique=True, help_text='Unique email address')

    # USERNAME_FIELD remains 'username' (inherited from AbstractUser)
    REQUIRED_FIELDS = ['name', 'email']  # prompted when creating superuser via CLI

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.username} ({self.name})'


class StudentProfile(models.Model):
    """
    Extended profile attached 1:1 to CustomUser.
    Stores gamification state and user preferences.
    """

    # ── Rank Ladder (XP thresholds) ──────────────────────────────────────
    RANK_LADDER = [
        ('Novice',       0),
        ('Apprentice',   1_000),
        ('Craftsman',    3_000),
        ('Specialist',   6_000),
        ('Expert',       10_000),
        ('Master',       15_000),
        ('Grandmaster',  25_000),
        ('Legend',       40_000),
    ]

    # Set of valid theme keys (matches ThemeContext.jsx on the frontend)
    VALID_THEMES = {
        'neo-brutalism', 'doraemon', 'shinchan', 'princess', 'anime',
    }

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile',
    )

    # Gamification — original fields
    xp = models.IntegerField(default=0, help_text='Legacy XP (from lessons)')
    coins = models.IntegerField(default=0)
    streak = models.IntegerField(default=0, help_text='Consecutive active days as of last_active_date — read current_streak for display')
    best_streak = models.PositiveIntegerField(default=0)
    # The streak that most recently broke — kept so it can be restored with coins
    broken_streak = models.PositiveIntegerField(default=0)
    broken_streak_last_day = models.DateField(null=True, blank=True)
    last_active_date = models.DateField(null=True, blank=True)

    # New fields
    total_xp = models.IntegerField(default=0, help_text='Cumulative XP across all tracks')
    current_rank = models.CharField(max_length=50, default='Novice')
    theme_preference = models.CharField(max_length=50, default='neo-brutalism')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=160, blank=True, default='')

    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'

    def __str__(self):
        return f'{self.user.username} — XP: {self.total_xp}, Rank: {self.current_rank}'

    # ── Streak helpers ───────────────────────────────────────────────────

    @property
    def current_streak(self):
        """The streak as of today: a day without activity since yesterday breaks it."""
        if not self.last_active_date:
            return 0
        if self.last_active_date < timezone.localdate() - timedelta(days=1):
            return 0
        return self.streak

    def register_activity_day(self, day):
        """Extend, keep, or restart the streak for activity on `day`. Caller saves."""
        if self.last_active_date == day:
            return
        if self.last_active_date == day - timedelta(days=1):
            self.streak += 1
        else:
            if self.streak > 0 and self.last_active_date:
                # Keep the broken streak so it can still be restored
                self.broken_streak = self.streak
                self.broken_streak_last_day = self.last_active_date
            self.streak = 1
        self.last_active_date = day
        self.best_streak = max(self.best_streak, self.streak)

    # A broken streak can be repaired if at most this many days were missed,
    # within a week of the last active day, for a coin price per missed day.
    STREAK_RESTORE_MAX_MISSED_DAYS = 2
    STREAK_RESTORE_WINDOW_DAYS = 7
    STREAK_RESTORE_COST_PER_DAY = 50

    def _broken_streak(self, today):
        """
        (lost_length, lost_last_day, new_streak, missed_days) for the most recent break,
        or None. Covers both "hasn't been back since" and "already started a new streak".
        """
        if not self.last_active_date:
            return None

        if self.streak > 0 and self.last_active_date < today - timedelta(days=1):
            # Broke and hasn't been active since
            missed = (today - self.last_active_date).days - 1
            return self.streak, self.last_active_date, 0, missed

        if self.broken_streak and self.broken_streak_last_day and self.current_streak > 0:
            # Broke, then started a new streak — the gap sits between the two
            new_start = self.last_active_date - timedelta(days=self.streak - 1)
            missed = (new_start - self.broken_streak_last_day).days - 1
            if missed > 0:
                return self.broken_streak, self.broken_streak_last_day, self.streak, missed

        return None

    def streak_restore_offer(self):
        """What restoring the last broken streak would cost and give, or None if it can't be."""
        today = timezone.localdate()
        broken = self._broken_streak(today)
        if not broken:
            return None
        lost, lost_last_day, new_streak, missed = broken
        if not 1 <= missed <= self.STREAK_RESTORE_MAX_MISSED_DAYS:
            return None
        if (today - lost_last_day).days > self.STREAK_RESTORE_WINDOW_DAYS:
            return None

        cost = missed * self.STREAK_RESTORE_COST_PER_DAY
        return {
            'lost_streak': lost,
            'missed_days': missed,
            'cost': cost,
            'restored_streak': lost + missed + new_streak,
            'can_afford': self.coins >= cost,
            'broken_on': lost_last_day + timedelta(days=1),
        }

    def restore_streak(self):
        """Pay coins to bridge the missed days. Returns the offer used. Caller saves."""
        offer = self.streak_restore_offer()
        if not offer:
            raise ValueError('There is no broken streak that can be restored.')
        if not offer['can_afford']:
            raise ValueError(f"Restoring this streak costs {offer['cost']} coins — you have {self.coins}.")

        self.coins -= offer['cost']
        self.streak = offer['restored_streak']
        if self.last_active_date < timezone.localdate() - timedelta(days=1):
            # Not active since the break: the streak now runs through yesterday
            self.last_active_date = timezone.localdate() - timedelta(days=1)
        self.best_streak = max(self.best_streak, self.streak)
        self.broken_streak = 0
        self.broken_streak_last_day = None
        return offer

    # ── Rank helpers ─────────────────────────────────────────────────────

    def compute_rank(self):
        """Derive the rank name from total_xp using the ladder."""
        rank = self.RANK_LADDER[0][0]
        for name, threshold in self.RANK_LADDER:
            if self.total_xp >= threshold:
                rank = name
            else:
                break
        return rank

    @property
    def next_rank(self):
        """Return the name of the next rank, or None if already Legend."""
        for i, (name, threshold) in enumerate(self.RANK_LADDER):
            if self.total_xp < threshold:
                return name
        return None  # Already at max rank

    @property
    def xp_to_next_rank(self):
        """XP still needed to reach the next rank. 0 if already Legend."""
        for _name, threshold in self.RANK_LADDER:
            if self.total_xp < threshold:
                return threshold - self.total_xp
        return 0

    @property
    def rank_progress_pct(self):
        """
        Percentage progress within the current rank bracket (0–100).
        Returns 100 if the user is at max rank.
        """
        prev_threshold = 0
        for _name, threshold in self.RANK_LADDER:
            if self.total_xp < threshold:
                bracket = threshold - prev_threshold
                progress = self.total_xp - prev_threshold
                return round((progress / bracket) * 100) if bracket else 100
            prev_threshold = threshold
        return 100  # Max rank reached
