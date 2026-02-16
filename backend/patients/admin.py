from django.contrib import admin

from .models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'city', 'state')
    search_fields = ('full_name', 'phone')
