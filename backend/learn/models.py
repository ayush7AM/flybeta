from django.db import models
from django.conf import settings


# ---------------------------------------------------------------------------
# Content models (populated via JSON loader management command)
# ---------------------------------------------------------------------------

class Domain(models.Model):
    """
    A learning track / domain.
    Examples: Data Science, AI & ML, Cloud Computing.
    """
    name = models.SlugField(max_length=64, unique=True, help_text='URL-safe slug, e.g. "data-science"')
    title = models.CharField(max_length=128, help_text='Display title, e.g. "Data Science"')
    icon = models.CharField(max_length=64, blank=True, help_text='Icon identifier (Material Symbol name or emoji)')
    color = models.CharField(max_length=7, blank=True, help_text='Track accent hex, e.g. "#059669"')
    track_code = models.CharField(max_length=10, blank=True, default='', help_text='Short code, e.g. "TS-01", "AI-01"')
    character_image = models.CharField(max_length=500, blank=True, default='', help_text='Path or URL to theme character image')
    is_published = models.BooleanField(default=True, help_text='Toggle track visibility from admin')

    class Meta:
        ordering = ['track_code', 'title']

    def __str__(self):
        return self.title


class Level(models.Model):
    """
    One of 10 sequential levels within a Domain.
    """
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='levels')
    number = models.PositiveSmallIntegerField(help_text='Level number 1-10')
    title = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    quiz_data = models.JSONField(blank=True, null=True, help_text='List of 5 dicts: {question, options, correct_index}')

    class Meta:
        ordering = ['domain', 'number']
        unique_together = ('domain', 'number')

    def __str__(self):
        return f'{self.domain.title} — Level {self.number}: {self.title}'


class Lesson(models.Model):
    """
    An individual lesson inside a Level.
    Completing all mandatory lessons unlocks the next level.
    """
    LESSON_TYPE_CHOICES = [
        ('theory', 'Theory'),
        ('lab', 'Lab'),
        ('quiz', 'Quiz'),
        ('boss', 'Boss Quiz'),
    ]

    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='lessons')
    order = models.PositiveSmallIntegerField(help_text='Display order within the level')
    title = models.CharField(max_length=256)
    content_md = models.TextField(blank=True, help_text='Lesson body in Markdown')
    xp_reward = models.PositiveIntegerField(default=10)
    coins_reward = models.PositiveIntegerField(default=5)
    is_mandatory = models.BooleanField(default=True, help_text='Must complete to unlock next level')
    illustration_url = models.URLField(blank=True, null=True, help_text='Optional illustration image URL for visual lesson headers')
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='theory', help_text='Category: theory, lab, quiz, or boss')

    class Meta:
        ordering = ['level', 'order']
        unique_together = ('level', 'order')

    def __str__(self):
        return f'L{self.level.number}.{self.order} — {self.title}'


# ---------------------------------------------------------------------------
# User progress models
# ---------------------------------------------------------------------------

class DomainProgress(models.Model):
    """
    Tracks a user's overall progress within a Domain (track).
    All domains are unlocked from day one (is_unlocked defaults True).
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='domain_progress')
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='user_progress')
    is_unlocked = models.BooleanField(default=True)
    current_level = models.PositiveSmallIntegerField(default=1)
    highest_unlocked_level = models.PositiveSmallIntegerField(default=1)

    class Meta:
        verbose_name = 'Domain Progress'
        verbose_name_plural = 'Domain Progress'
        unique_together = ('user', 'domain')

    def __str__(self):
        return f'{self.user.username} → {self.domain.title} (Level {self.current_level})'


class LevelProgress(models.Model):
    """
    Tracks which lessons a user has completed within a specific Level.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='level_progress')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='user_progress')
    is_completed = models.BooleanField(default=False)
    lessons_completed = models.ManyToManyField(Lesson, blank=True, related_name='completed_by')

    class Meta:
        verbose_name = 'Level Progress'
        verbose_name_plural = 'Level Progress'
        unique_together = ('user', 'level')

    def __str__(self):
        status = '✓' if self.is_completed else '…'
        return f'{self.user.username} → {self.level} [{status}]'


class CapstoneSubmission(models.Model):
    """
    User submission for a Capstone project.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('graded', 'Graded'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='capstone_submissions')
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='capstone_submissions')
    github_url = models.URLField(help_text="URL to the user's GitHub repository")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ai_feedback = models.TextField(blank=True, null=True, help_text="Markdown formatted AI feedback")
    score = models.IntegerField(blank=True, null=True, help_text="0-100 score")
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} → {self.domain.title} Capstone ({self.status})'

