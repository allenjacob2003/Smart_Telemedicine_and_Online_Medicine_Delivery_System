from django.conf import settings
from django.db import models


class Payment(models.Model):
	PAYMENT_TYPE_CHOICES = [
		('consultation', 'Consultation'),
		('pharmacy', 'Pharmacy'),
	]

	STATUS_CHOICES = [
		('success', 'Success'),
		('failed', 'Failed'),
	]

	patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
	payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES)
	razorpay_order_id = models.CharField(max_length=100, blank=True)
	razorpay_payment_id = models.CharField(max_length=100, blank=True)
	related_id = models.PositiveIntegerField(null=True, blank=True)
	description = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.patient} - {self.payment_type} - {self.amount}"
