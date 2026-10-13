from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views import DomainViewSet, LevelViewSet, LessonViewSet, UserMeView, UserProfileView, BlueprintView, CodeReviewView, SynapseExtractView, OracleChatView, CapstoneSubmissionViewSet

router = DefaultRouter()
router.register(r'domains', DomainViewSet)
router.register(r'levels', LevelViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'capstone', CapstoneSubmissionViewSet, basename='capstone')

app_name = 'api'

urlpatterns = [
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/profile/', UserProfileView.as_view(), name='user-profile'),
    path('ai/architect/', BlueprintView.as_view(), name='ai-architect'),
    path('ai/reviewer/', CodeReviewView.as_view(), name='ai-reviewer'),
    path('ai/synapse/', SynapseExtractView.as_view(), name='ai-synapse'),
    path('ai/oracle/', OracleChatView.as_view(), name='oracle_chat'),
    path('', include(router.urls)),
]

