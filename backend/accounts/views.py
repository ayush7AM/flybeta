from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.serializers import (
    RegisterSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

class RegisterView(CreateAPIView):
    """
    POST /api/v1/auth/register/
    Accepts: name, username, email, password, password_confirm
    Returns: created user data (minus password)
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # No auth required for registration

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Account created successfully.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'name': user.name,
                    'email': user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Password Reset — Request
# ---------------------------------------------------------------------------

class PasswordResetRequestView(GenericAPIView):
    """
    POST /api/v1/auth/password-reset/
    Accepts: email
    Generates a reset token and sends a password reset email to the console.
    """
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'If an account with that email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Password Reset — Confirm
# ---------------------------------------------------------------------------

class PasswordResetConfirmView(GenericAPIView):
    """
    POST /api/v1/auth/password-reset-confirm/
    Accepts: uid, token, new_password
    Validates the token and updates the user's password.
    """
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Password has been reset successfully.'},
            status=status.HTTP_200_OK,
        )
