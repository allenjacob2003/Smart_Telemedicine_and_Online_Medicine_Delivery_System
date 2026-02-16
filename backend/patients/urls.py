from django.urls import path

from .views import (
    consultation_request,
    consultation_requests_list,
    confirmed_appointments,
    dashboard_summary,
    my_orders,
    patient_profile,
    patient_profile_detail,
    patient_profile_list,
    patient_profile_update,
    place_order,
    prescriptions,
)

urlpatterns = [
    path('profiles/', patient_profile_list, name='patient-profile-list'),
    path('profiles/<int:pk>/', patient_profile_detail, name='patient-profile-detail'),
    path('dashboard-summary/', dashboard_summary, name='patient-dashboard-summary'),
    path('consultation-request/', consultation_request, name='patient-consultation-request'),
    path('consultation-requests/', consultation_requests_list, name='patient-consultation-requests-list'),
    path('confirmed-appointments/', confirmed_appointments, name='patient-confirmed-appointments'),
    path('prescriptions/', prescriptions, name='patient-prescriptions'),
    path('place-order/', place_order, name='patient-place-order'),
    path('my-orders/', my_orders, name='patient-my-orders'),
    path('orders/', my_orders, name='patient-orders'),
    path('profile/', patient_profile, name='patient-profile'),
    path('profile/update/', patient_profile_update, name='patient-profile-update'),
]
