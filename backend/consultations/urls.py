from django.urls import path

from .views import appointment_list

urlpatterns = [
	path('appointments/', appointment_list, name='appointment-list'),
]
