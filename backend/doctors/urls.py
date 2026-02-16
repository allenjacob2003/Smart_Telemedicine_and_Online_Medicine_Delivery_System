from django.urls import path

from .views import (
    approve_request,
    confirmed_appointments,
    consultation_requests,
    department_list,
    doctors_by_department,
    doctor_profile,
    doctor_profile_detail,
    doctor_profile_list,
    doctor_profile_update,
    prescription_history,
    reject_request,
    search_patient,
    upload_prescription,
)

urlpatterns = [
    path('profiles/', doctor_profile_list, name='doctor-profile-list'),
    path('profiles/<int:pk>/', doctor_profile_detail, name='doctor-profile-detail'),
    path('departments/', department_list, name='department-list'),
    path('departments/doctors/', doctors_by_department, name='doctors-by-department'),
    path('profile/', doctor_profile, name='doctor-profile'),
    path('profile/update/', doctor_profile_update, name='doctor-profile-update'),
    path('confirmed-appointments/', confirmed_appointments, name='doctor-confirmed-appointments'),
    path('consultation-requests/', consultation_requests, name='doctor-consultation-requests'),
    path('approve-request/<int:pk>/', approve_request, name='doctor-approve-request'),
    path('reject-request/<int:pk>/', reject_request, name='doctor-reject-request'),
    path('search-patient/', search_patient, name='doctor-search-patient'),
    path('upload-prescription/', upload_prescription, name='doctor-upload-prescription'),
    path('prescription-history/', prescription_history, name='doctor-prescription-history'),
]
