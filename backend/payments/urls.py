from django.urls import path

from .views import create_order, payments_list, payments_summary, verify_payment

urlpatterns = [
	path('summary/', payments_summary, name='payments-summary'),
	path('list/', payments_list, name='payments-list'),
	path('create-order/', create_order, name='payments-create-order'),
	path('verify-payment/', verify_payment, name='payments-verify-payment'),
]
