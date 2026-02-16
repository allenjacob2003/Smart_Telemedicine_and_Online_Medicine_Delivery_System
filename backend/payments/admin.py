from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
	list_display = ('id', 'patient', 'payment_type', 'amount', 'status', 'created_at')
	list_filter = ('payment_type', 'status', 'created_at')
	search_fields = ('patient__email', 'razorpay_order_id', 'razorpay_payment_id')
