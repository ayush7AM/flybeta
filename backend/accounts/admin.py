from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import CustomUser, StudentProfile


class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    verbose_name_plural = 'Student Profile'
    fields = ('xp', 'coins', 'streak', 'last_active_date', 'total_xp', 'current_rank', 'theme_preference')


class CustomUserAdmin(BaseUserAdmin):
    inlines = (StudentProfileInline,)
    list_display = ('username', 'name', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    search_fields = ('username', 'name', 'email')

    # Extend fieldsets to include our custom 'name' field
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('name',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile', {'fields': ('name', 'email')}),
    )


admin.site.register(CustomUser, CustomUserAdmin)
