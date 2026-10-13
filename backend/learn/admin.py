from django.contrib import admin

from learn.models import Domain, Level, Lesson, DomainProgress, LevelProgress, CapstoneSubmission


# ---------------------------------------------------------------------------
# Content models
# ---------------------------------------------------------------------------

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('title', 'name', 'track_code', 'color', 'icon', 'is_published')
    list_filter = ('is_published',)
    list_editable = ('is_published',)
    search_fields = ('title', 'name', 'track_code')
    prepopulated_fields = {'name': ('title',)}


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ('order', 'title', 'lesson_type', 'xp_reward', 'coins_reward', 'is_mandatory')
    ordering = ('order',)


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'domain', 'number', 'title')
    list_filter = ('domain',)
    search_fields = ('title', 'domain__title')
    inlines = (LessonInline,)


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'order', 'lesson_type', 'xp_reward', 'coins_reward', 'is_mandatory')
    list_filter = ('level__domain', 'lesson_type', 'is_mandatory')
    search_fields = ('title',)


# ---------------------------------------------------------------------------
# Progress models
# ---------------------------------------------------------------------------

@admin.register(DomainProgress)
class DomainProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'domain', 'current_level', 'is_unlocked')
    list_filter = ('domain', 'is_unlocked')
    search_fields = ('user__username',)


@admin.register(LevelProgress)
class LevelProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'level', 'is_completed')
    list_filter = ('level__domain', 'is_completed')
    search_fields = ('user__username',)


# ---------------------------------------------------------------------------
# Capstone model
# ---------------------------------------------------------------------------

@admin.register(CapstoneSubmission)
class CapstoneSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'domain', 'status', 'score', 'passed', 'created_at')
    list_filter = ('domain', 'status', 'passed')
    search_fields = ('user__username', 'domain__title')
    readonly_fields = ('ai_feedback', 'score', 'passed', 'created_at', 'updated_at')
