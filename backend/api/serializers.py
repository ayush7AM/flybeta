from rest_framework import serializers

from learn.models import Domain, Level, Lesson, DomainProgress, CapstoneSubmission
from accounts.models import StudentProfile

class DomainProgressSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    track_completed = serializers.SerializerMethodField()

    class Meta:
        model = DomainProgress
        fields = [
            'domain_name', 'is_unlocked', 'current_level', 'highest_unlocked_level',
            'track_completed', 'completed_at', 'certificate_id',
        ]

    def get_track_completed(self, obj):
        return obj.completed_at is not None


class UserStatsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    streak = serializers.IntegerField(source='current_streak', read_only=True)
    domain_progress = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = ['username', 'xp', 'coins', 'streak', 'last_active_date', 'total_xp', 'current_rank', 'domain_progress']

    def get_domain_progress(self, obj):
        progress = obj.user.domain_progress.all()
        return DomainProgressSerializer(progress, many=True).data


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'level', 'order', 'title',
            'content_md', 'xp_reward', 'coins_reward', 'is_mandatory',
            'illustration_url', 'lesson_type',
        ]


class LevelSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quiz_data = serializers.SerializerMethodField()

    class Meta:
        model = Level
        fields = ['id', 'domain', 'number', 'title', 'description', 'lessons', 'quiz_data']

    def get_quiz_data(self, obj):
        # Answers stay server-side — quizzes are graded by LevelViewSet.pass_quiz
        if not obj.quiz_data:
            return obj.quiz_data
        return [
            {key: value for key, value in question.items() if key != 'correct_index'}
            for question in obj.quiz_data
        ]


class LessonSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'order', 'title', 'xp_reward', 'is_mandatory', 'lesson_type']


class LevelSummarySerializer(serializers.ModelSerializer):
    lessons = LessonSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Level
        fields = ['id', 'number', 'title', 'description', 'lessons']


class DomainListSerializer(serializers.ModelSerializer):
    """Track cards only need titles and counts — the full payload is ~15x larger."""
    levels = LevelSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Domain
        fields = ['id', 'name', 'title', 'icon', 'color', 'track_code', 'character_image', 'is_published', 'levels']


class DomainSerializer(serializers.ModelSerializer):
    levels = LevelSerializer(many=True, read_only=True)

    class Meta:
        model = Domain
        fields = ['id', 'name', 'title', 'icon', 'color', 'track_code', 'character_image', 'is_published', 'levels']


class CapstoneSubmissionSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.title', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CapstoneSubmission
        fields = [
            'id', 'user', 'username', 'domain', 'domain_name',
            'github_url', 'status', 'ai_feedback', 'score', 'passed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'ai_feedback', 'score', 'passed', 'user']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Full profile payload for the Dashboard page.
    Includes identity, gamification stats, rank progress, and theme preference.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    name = serializers.CharField(source='user.name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    streak = serializers.IntegerField(source='current_streak', read_only=True)
    streak_restore = serializers.SerializerMethodField()
    domain_progress = serializers.SerializerMethodField()
    completed_lesson_ids = serializers.SerializerMethodField()

    # Computed rank fields (from model properties)
    next_rank = serializers.CharField(read_only=True)
    xp_to_next_rank = serializers.IntegerField(read_only=True)
    rank_progress_pct = serializers.IntegerField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'username', 'name', 'email',
            'xp', 'total_xp', 'coins', 'streak', 'best_streak', 'last_active_date',
            'current_rank', 'next_rank', 'xp_to_next_rank', 'rank_progress_pct',
            'theme_preference',
            'avatar', 'bio',
            'streak_restore', 'domain_progress', 'completed_lesson_ids',
        ]
        read_only_fields = [
            'username', 'name', 'email',
            'xp', 'total_xp', 'coins', 'streak', 'best_streak', 'last_active_date',
            'current_rank', 'next_rank', 'xp_to_next_rank', 'rank_progress_pct',
            'avatar',
        ]

    def get_domain_progress(self, obj):
        progress = obj.user.domain_progress.all()
        return DomainProgressSerializer(progress, many=True).data

    def get_completed_lesson_ids(self, obj):
        return list(
            Lesson.objects.filter(completed_by__user=obj.user).values_list('id', flat=True).distinct()
        )

    def get_streak_restore(self, obj):
        return obj.streak_restore_offer()
