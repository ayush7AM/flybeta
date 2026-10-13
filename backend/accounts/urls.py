from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import RegisterView, PasswordResetRequestView, PasswordResetConfirmView

app_name = 'accounts'

urlpatterns = [
    # Registration
    path('register/', RegisterView.as_view(), name='register'),

    # JWT login (obtain access + refresh tokens)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT refresh
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Password reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
