from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser, StudentProfile


@receiver(post_save, sender=CustomUser)
def create_student_profile(sender, instance, created, **kwargs):
    """Auto-create a StudentProfile whenever a new CustomUser is created."""
    if created:
        StudentProfile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_student_profile(sender, instance, **kwargs):
    """Ensure the profile is saved when the User is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
