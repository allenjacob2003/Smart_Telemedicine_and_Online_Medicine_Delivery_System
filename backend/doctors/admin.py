from django.contrib import admin

from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'specialization', 'phone')
    search_fields = ('full_name', 'specialization', 'phone')
