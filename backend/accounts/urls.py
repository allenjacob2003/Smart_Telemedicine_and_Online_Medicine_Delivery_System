from django.urls import path

from .views import (
    patient_login,
    role_login,
    patient_register,
    create_doctor,
    admin_patient_list,
    admin_patient_status,
    admin_patient_delete,
    admin_doctor_list,
    admin_doctor_status,
    admin_doctor_delete,
    admin_messages,
    test_email,
)

urlpatterns = [
    path('patient-login/', patient_login, name='patient-login'),
    path('patient-register/', patient_register, name='patient-register'),
    path('role-login/', role_login, name='role-login'),
    path('create-doctor/', create_doctor, name='create-doctor'),
    path('admin/patients/', admin_patient_list, name='admin-patient-list'),
    path('admin/patients/<int:user_id>/status/', admin_patient_status, name='admin-patient-status'),
    path('admin/patients/<int:user_id>/delete/', admin_patient_delete, name='admin-patient-delete'),
    path('admin/doctors/', admin_doctor_list, name='admin-doctor-list'),
    path('admin/doctors/<int:user_id>/status/', admin_doctor_status, name='admin-doctor-status'),
    path('admin/doctors/<int:user_id>/delete/', admin_doctor_delete, name='admin-doctor-delete'),
    path('messages/', admin_messages, name='admin-messages'),
    path('admin/messages/', admin_messages, name='admin-messages-admin'),
    path('test-email/', test_email, name='test-email'),
]
