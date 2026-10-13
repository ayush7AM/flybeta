"""
Management command: create_dev_user

Creates a development superuser with a StudentProfile for local API testing.
Safe to re-run — skips if user already exists.

Usage:
    python manage.py create_dev_user
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from accounts.models import StudentProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a development superuser (dev/flybeta123) with a StudentProfile.'

    DEV_USERNAME = 'dev'
    DEV_PASSWORD = 'flybeta123'
    DEV_EMAIL = 'dev@flybeta.local'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=self.DEV_USERNAME,
            defaults={
                'email': self.DEV_EMAIL,
                'name': 'Dev User',
                'is_staff': True,
                'is_superuser': True,
            },
        )

        if created:
            user.set_password(self.DEV_PASSWORD)
            user.save()
            self.stdout.write(self.style.SUCCESS(
                f'✓ Created superuser: {self.DEV_USERNAME} / {self.DEV_PASSWORD}'
            ))
        else:
            self.stdout.write(f'~ User "{self.DEV_USERNAME}" already exists, skipping.')

        # Ensure StudentProfile exists (signal should create it, but be safe)
        profile, p_created = StudentProfile.objects.get_or_create(user=user)
        if p_created:
            self.stdout.write(self.style.SUCCESS('✓ Created StudentProfile'))
        else:
            self.stdout.write(
                f'~ StudentProfile exists — XP: {profile.total_xp}, '
                f'Coins: {profile.coins}, Streak: {profile.streak}'
            )

        self.stdout.write(self.style.SUCCESS('\nDev user ready. Login at /admin/ or use for API testing.'))
