import logging
import re
import uuid
from datetime import timedelta

# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from django.db import transaction
# pyrefly: ignore [missing-import]
from django.utils import timezone
# pyrefly: ignore [missing-import]
from django.db.models import Max
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from learn.models import Domain, Level, Lesson, LevelProgress, DomainProgress, CapstoneSubmission, DailyActivity
from learn.services.activity import record_activity
from accounts.models import StudentProfile
from api.serializers import (
    DomainSerializer, DomainListSerializer, LevelSerializer, LessonSerializer, UserStatsSerializer,
    CapstoneSubmissionSerializer, UserProfileSerializer
)
from api.ai_services import generate_project_blueprint, generate_code_review, generate_video_quiz, ask_oracle
from learn.services.github_service import fetch_github_repo_content, parse_repo_url, RepoFetchError
from learn.services.ai_evaluator import evaluate_code
from rest_framework import mixins, viewsets
from rest_framework.throttling import ScopedRateThrottle

logger = logging.getLogger(__name__)


def get_dev_user():
    """Get the dev user for mock auth. In production, use request.user instead."""
    User = get_user_model()
    return User.objects.get(username='dev')


QUIZ_PASS_PERCENT = 60
QUIZ_XP_REWARD = 50
CAPSTONE_XP_REWARD = 500
CAPSTONE_COINS_REWARD = 100
MAX_ACTIVITY_DAYS = 366


def get_highest_unlocked_level(user, domain):
    """The highest level number the user may access in a domain (Level 1 is always open)."""
    progress = DomainProgress.objects.filter(user=user, domain=domain).first()
    return progress.highest_unlocked_level if progress else 1


def unlock_next_level(user, level):
    """
    Advance the user's frontier past `level` if it is their highest unlocked level.
    Returns True if a new level was unlocked. Call inside transaction.atomic() —
    the DomainProgress row lock stops double submits from unlocking/rewarding twice.
    """
    domain_progress, _ = DomainProgress.objects.select_for_update().get_or_create(
        user=user,
        domain=level.domain,
    )
    last_level = level.domain.levels.aggregate(Max('number'))['number__max']
    if domain_progress.highest_unlocked_level != level.number or level.number >= last_level:
        return False

    domain_progress.highest_unlocked_level += 1
    domain_progress.current_level = domain_progress.highest_unlocked_level
    domain_progress.save(update_fields=['highest_unlocked_level', 'current_level'])
    return True


class UserMeView(APIView):
    """
    GET /api/v1/users/me/
    Returns the current user's gamification stats.
    """
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserStatsSerializer(request.user.profile)
        return Response(serializer.data)


class UserProfileView(APIView):
    """
    GET  /api/v1/users/profile/  — full dashboard payload (rank, XP, theme, progress)
    PATCH /api/v1/users/profile/ — update name, bio, avatar, theme_preference
    """
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile = request.user.profile
        # Auto-sync rank from XP on every read
        computed = profile.compute_rank()
        if profile.current_rank != computed:
            profile.current_rank = computed
            profile.save(update_fields=['current_rank'])
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.profile
        user = request.user
        updated_fields = []
        updated_user_fields = []

        # ── Name (on CustomUser) ─────────────────────────────────────
        name = request.data.get('name')
        if name is not None:
            user.name = name.strip()
            updated_user_fields.append('name')

        # ── Bio (on StudentProfile) ──────────────────────────────────
        bio = request.data.get('bio')
        if bio is not None:
            if len(bio) > 160:
                return Response(
                    {'error': 'Bio must be 160 characters or fewer.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.bio = bio.strip()
            updated_fields.append('bio')

        # ── Avatar (file upload) ─────────────────────────────────────
        avatar = request.FILES.get('avatar')
        if avatar is not None:
            profile.avatar = avatar
            updated_fields.append('avatar')

        # ── Theme preference ─────────────────────────────────────────
        theme = request.data.get('theme_preference')
        if theme is not None:
            if theme not in StudentProfile.VALID_THEMES:
                return Response(
                    {'error': f'Invalid theme. Choose from: {sorted(StudentProfile.VALID_THEMES)}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.theme_preference = theme
            updated_fields.append('theme_preference')

        # ── Persist ──────────────────────────────────────────────────
        if updated_user_fields:
            user.save(update_fields=updated_user_fields)
        if updated_fields:
            profile.save(update_fields=updated_fields)

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)


class DomainViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for learning domains (tracks).
    Lists all domains with nested levels and lessons.
    """
    queryset = Domain.objects.filter(is_published=True).prefetch_related('levels__lessons').all()
    serializer_class = DomainSerializer
    lookup_field = 'name'  # Allow lookup by slug: /api/v1/domains/cloud/

    def get_serializer_class(self):
        # The track list only needs titles and counts — not every lesson's Markdown
        return DomainListSerializer if self.action == 'list' else DomainSerializer


class LevelViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for levels.
    Supports filtering by domain: /api/v1/levels/?domain=cloud
    """
    queryset = Level.objects.select_related('domain').prefetch_related('lessons').all()
    serializer_class = LevelSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        domain_name = self.request.query_params.get('domain')
        if domain_name:
            qs = qs.filter(domain__name=domain_name)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def pass_quiz(self, request, pk=None):
        """
        POST /api/v1/levels/{id}/pass_quiz/
        Body: {"answers": [option_index, ...]} — one entry per quiz question.

        Grades the answers server-side. A passing score unlocks the next level
        and awards XP the first time the level is cleared.
        """
        level = self.get_object()
        user = request.user
        quiz = level.quiz_data or []

        if not quiz:
            return Response(
                {'error': 'This level has no quiz.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if level.number > get_highest_unlocked_level(user, level.domain):
            return Response(
                {'error': 'This level is locked.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        answers = request.data.get('answers')
        if not isinstance(answers, list) or len(answers) != len(quiz):
            return Response(
                {'error': f'"answers" must be a list of {len(quiz)} option indexes.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        score = sum(1 for question, answer in zip(quiz, answers) if answer == question.get('correct_index'))
        passed = score * 100 >= QUIZ_PASS_PERCENT * len(quiz)
        level_unlocked = False

        if passed:
            with transaction.atomic():
                level_unlocked = unlock_next_level(user, level)
                profile = user.profile
                xp_awarded = QUIZ_XP_REWARD if level_unlocked else 0
                if level_unlocked:
                    profile.xp += xp_awarded
                    profile.total_xp += xp_awarded
                    profile.current_rank = profile.compute_rank()
                record_activity(profile, quizzes=1, xp=xp_awarded)
                profile.save()

        return Response({
            'passed': passed,
            'score': score,
            'total': len(quiz),
            'level_unlocked': level_unlocked,
            'user': UserProfileSerializer(user.profile).data
        }, status=status.HTTP_200_OK)


class LessonViewSet(ReadOnlyModelViewSet):
    """
    Read-only API for individual lessons.
    Supports filtering by level: /api/v1/lessons/?level=<id>
    Also provides POST /api/v1/lessons/{id}/complete/ to mark lesson done.
    """
    queryset = Lesson.objects.select_related('level__domain').all()
    serializer_class = LessonSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        level_id = self.request.query_params.get('level')
        if level_id:
            qs = qs.filter(level_id=level_id)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """
        POST /api/v1/lessons/{id}/complete/

        Marks a lesson as completed for the current user:
        1. Get-or-create LevelProgress for this user + lesson's level
        2. Add lesson to lessons_completed (idempotent)
        3. Award XP and coins to UserProfile
        4. Update streak based on last_active_date
        5. Check if all mandatory lessons are done → mark level complete
           (and unlock the next level if this level has no boss quiz)
        6. Return updated user stats
        """
        lesson = self.get_object()
        user = request.user
        profile = user.profile
        next_level_unlocked = False

        if lesson.level.number > get_highest_unlocked_level(user, lesson.level.domain):
            return Response(
                {'error': 'This level is locked.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            # 1. Get or create LevelProgress
            level_progress, _ = LevelProgress.objects.get_or_create(
                user=user,
                level=lesson.level,
            )

            # 2. Check if already completed (idempotent)
            already_completed = level_progress.lessons_completed.filter(pk=lesson.pk).exists()

            if not already_completed:
                # Add lesson to completed set
                level_progress.lessons_completed.add(lesson)

                # 3. Award XP and coins
                profile.xp += lesson.xp_reward
                profile.total_xp += lesson.xp_reward
                profile.coins += lesson.coins_reward

                # 4. Streak + activity heatmap
                record_activity(profile, lessons=1, xp=lesson.xp_reward)

                profile.current_rank = profile.compute_rank()
                profile.save()

            # 5. Check level completion (all mandatory lessons done?)
            mandatory_lessons = set(
                lesson.level.lessons.filter(is_mandatory=True).values_list('pk', flat=True)
            )
            completed_lessons = set(
                level_progress.lessons_completed.values_list('pk', flat=True)
            )
            level_completed = mandatory_lessons.issubset(completed_lessons)

            if level_completed and not level_progress.is_completed:
                level_progress.is_completed = True
                level_progress.save()

            # Levels with a boss quiz unlock via pass_quiz instead
            if level_completed and not lesson.level.quiz_data:
                next_level_unlocked = unlock_next_level(user, lesson.level)

        # 6. Return updated stats (full profile payload)
        return Response({
            'status': 'already_completed' if already_completed else 'completed',
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'xp_reward': lesson.xp_reward,
                'coins_reward': lesson.coins_reward,
            },
            'user': UserProfileSerializer(profile).data,
            'level_completed': level_completed,
            'next_level_unlocked': next_level_unlocked,
        }, status=status.HTTP_200_OK)


class BlueprintView(APIView):
    """
    POST /api/v1/ai/architect/

    Accepts a project prompt and returns a step-by-step blueprint.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()

        if not prompt:
            return Response(
                {'error': 'A "prompt" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            steps = generate_project_blueprint(prompt)
            return Response({
                'prompt': prompt,
                'steps': steps,
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.exception('AI request failed')
            return Response(
                {'error': 'The Architect is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CodeReviewView(APIView):
    """
    POST /api/v1/ai/reviewer/

    Accepts a code snippet and returns structured review findings.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip()

        if not code:
            return Response(
                {'error': 'A "code" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        language = request.data.get('language', 'python').strip()
        try:
            findings = generate_code_review(code, language)
            return Response({
                'code': code,
                'language': language,
                'findings': findings,
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.exception('AI request failed')
            return Response(
                {'error': 'The Reviewer is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SynapseExtractView(APIView):
    """
    POST /api/v1/ai/synapse/
    Accepts video_url, extracts video_id, calls Gemini for quiz generation.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        video_url = request.data.get('video_url', '').strip()
        
        if not video_url:
            return Response(
                {'error': 'A "video_url" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        # Extract ID using regex
        video_id = None
        patterns = [
            r'(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})',
            r'(?:youtu\.be\/)([a-zA-Z0-9_-]{11})',
            r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
            r'^([a-zA-Z0-9_-]{11})$' # allow raw ID
        ]
        
        for pattern in patterns:
            match = re.search(pattern, video_url)
            if match:
                video_id = match.group(1)
                break
                
        if not video_id:
            return Response(
                {'error': 'Invalid YouTube URL or ID.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        try:
            quiz = generate_video_quiz(video_id)
            return Response(quiz, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception('AI request failed')
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OracleChatView(APIView):
    """
    POST /api/v1/ai/oracle/
    Accepts message and history, calls ask_oracle, returns reply.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not message:
            return Response(
                {'error': 'A "message" field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply = ask_oracle(message, history)
            return Response({'reply': reply}, status=status.HTTP_200_OK)
        except Exception:
            logger.exception('AI request failed')
            return Response(
                {'error': 'The Oracle is meditating. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CapstoneSubmissionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    POST /api/v1/capstone/  — submit a GitHub repo for AI grading (final level only)
    GET  /api/v1/capstone/  — the current user's own submissions
    GET  /api/v1/capstone/{id}/

    Submissions are immutable once created and visible only to their owner.
    """
    serializer_class = CapstoneSubmissionSerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = 'capstone'

    def get_queryset(self):
        return CapstoneSubmission.objects.filter(user=self.request.user).select_related('domain', 'user')

    def get_throttles(self):
        # Each submission costs GitHub + Gemini calls; reads are free
        return [ScopedRateThrottle()] if self.action == 'create' else []

    def create(self, request, *args, **kwargs):
        user = request.user
        domain_id = request.data.get('domain')
        github_url = (request.data.get('github_url') or '').strip()

        if not domain_id or not github_url:
            return Response({'error': 'domain and github_url are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            owner, repo = parse_repo_url(github_url)
        except RepoFetchError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            domain = Domain.objects.get(pk=domain_id, is_published=True)
        except (Domain.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Domain not found'}, status=status.HTTP_404_NOT_FOUND)

        final_level = domain.levels.aggregate(Max('number'))['number__max']
        if final_level is None or get_highest_unlocked_level(user, domain) < final_level:
            return Response(
                {'error': f'Reach Level {final_level} of {domain.title} to submit its capstone.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 1. Save as pending
        submission = CapstoneSubmission.objects.create(
            user=user,
            domain=domain,
            github_url=f'https://github.com/{owner}/{repo}',
            status='pending'
        )

        try:
            # 2. Fetch code from GitHub
            code_content = fetch_github_repo_content(submission.github_url)

            # 3. Grade using AI
            eval_result = evaluate_code(domain.title, code_content)
        except RepoFetchError as e:
            # Something the student can fix — tell them exactly what
            submission.status = 'failed'
            submission.ai_feedback = str(e)
            submission.save()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            # GitHub or Gemini trouble is not a failing grade
            logger.exception('Capstone evaluation failed for submission %s', submission.pk)
            submission.status = 'failed'
            submission.ai_feedback = 'Evaluation could not be completed due to a service error.'
            submission.save()
            return Response(
                {'error': 'The AI evaluator is unavailable right now. Please try again in a few minutes.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # 4. Update the submission
        submission.score = eval_result['score']
        submission.passed = eval_result['passed']
        submission.ai_feedback = eval_result['feedback']
        submission.status = 'graded'
        submission.save()

        # 5. First pass completes the track: reward + certificate
        reward = None
        if submission.passed:
            reward = self._complete_track(user, domain)

        # 6. Return updated submission (+ fresh profile so the navbar updates)
        data = dict(self.get_serializer(submission).data)
        data['reward'] = reward
        data['user'] = UserProfileSerializer(user.profile).data
        return Response(data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _complete_track(user, domain):
        """Mark the track complete on its first passing capstone. Returns the reward given."""
        with transaction.atomic():
            progress, _ = DomainProgress.objects.select_for_update().get_or_create(user=user, domain=domain)
            first_completion = progress.completed_at is None
            if first_completion:
                progress.completed_at = timezone.now()
                progress.certificate_id = uuid.uuid4()
                progress.save(update_fields=['completed_at', 'certificate_id'])

            profile = user.profile
            xp = CAPSTONE_XP_REWARD if first_completion else 0
            coins = CAPSTONE_COINS_REWARD if first_completion else 0
            profile.xp += xp
            profile.total_xp += xp
            profile.coins += coins
            profile.current_rank = profile.compute_rank()
            record_activity(profile, capstones=1, xp=xp)
            profile.save()

        return {
            'xp': xp,
            'coins': coins,
            'first_completion': first_completion,
            'certificate_id': str(progress.certificate_id),
        }


class StreakRestoreView(APIView):
    """
    POST /api/v1/users/streak/restore/
    Spend coins to repair a recently broken streak (see StudentProfile.streak_restore_offer).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        with transaction.atomic():
            profile = StudentProfile.objects.select_for_update().get(user=request.user)
            try:
                offer = profile.restore_streak()
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            profile.save()

        return Response({
            'restored_streak': profile.streak,
            'coins_spent': offer['cost'],
            'user': UserProfileSerializer(profile).data,
        })


class UserActivityView(APIView):
    """
    GET /api/v1/users/activity/?days=182
    The user's active days (for the heatmap) plus streak stats.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            days = min(max(int(request.query_params.get('days', 182)), 1), MAX_ACTIVITY_DAYS)
        except ValueError:
            days = 182
        today = timezone.localdate()
        rows = DailyActivity.objects.filter(user=request.user, date__gte=today - timedelta(days=days - 1))
        profile = request.user.profile
        return Response({
            'today': today,
            'days': [
                {
                    'date': row.date,
                    'count': row.activity_count,
                    'lessons': row.lessons_completed,
                    'quizzes': row.quizzes_passed,
                    'capstones': row.capstones_passed,
                    'xp': row.xp_earned,
                }
                for row in rows
            ],
            'current_streak': profile.current_streak,
            'best_streak': profile.best_streak,
            'total_active_days': DailyActivity.objects.filter(user=request.user).count(),
        })


class CertificateView(APIView):
    """
    GET /api/v1/certificates/<uuid>/
    Public, so a certificate link can be shared and verified by anyone.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, certificate_id):
        progress = DomainProgress.objects.select_related('user', 'domain').filter(
            certificate_id=certificate_id, completed_at__isnull=False,
        ).first()
        if not progress:
            return Response({'error': 'Certificate not found.'}, status=status.HTTP_404_NOT_FOUND)

        best = CapstoneSubmission.objects.filter(
            user=progress.user, domain=progress.domain, passed=True,
        ).aggregate(Max('score'))['score__max']
        return Response({
            'certificate_id': progress.certificate_id,
            'name': progress.user.name or progress.user.username,
            'username': progress.user.username,
            'track_title': progress.domain.title,
            'track_name': progress.domain.name,
            'completed_at': progress.completed_at,
            'score': best,
        })
