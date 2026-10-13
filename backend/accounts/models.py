from django.db import models
from django.contrib.auth.models import AbstractUser


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
    streak = models.IntegerField(default=0)
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
