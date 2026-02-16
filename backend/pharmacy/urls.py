from django.urls import path

from .views import (
	dashboard_summary,
	order_list,
	payments_summary,
	pharmacy_profile,
	stock_list,
	update_order,
	update_stock,
	add_medicine,
)

urlpatterns = [
	path('dashboard-summary/', dashboard_summary, name='pharmacy-dashboard-summary'),
	path('orders/', order_list, name='pharmacy-orders'),
	path('update-order/<int:pk>/', update_order, name='pharmacy-update-order'),
	path('payments-summary/', payments_summary, name='pharmacy-payments-summary'),
	path('stock/', stock_list, name='pharmacy-stock'),
	path('medicines/', stock_list, name='pharmacy-medicines-alias'),  # <-- add alias to prevent 404
	path('add-medicine/', add_medicine, name='pharmacy-add-medicine'),
	path('update-stock/<int:pk>/', update_stock, name='pharmacy-update-stock'),
	path('profile/', pharmacy_profile, name='pharmacy-profile'),
]
