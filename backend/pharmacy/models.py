from django.conf import settings
from django.db import models


class PharmacyProfile(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pharmacy_profile')
	pharmacy_name = models.CharField(max_length=200)
	location = models.CharField(max_length=200, blank=True)
	phone = models.CharField(max_length=30, blank=True)
	status = models.CharField(max_length=20, default='Active')
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.pharmacy_name


class MedicineStock(models.Model):
	name = models.CharField(max_length=200)
	category = models.CharField(max_length=120, blank=True)
	price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	available_quantity = models.PositiveIntegerField(default=0)
	low_stock_threshold = models.PositiveIntegerField(default=10)
	expiry_date = models.DateField(null=True, blank=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name


class MedicineOrder(models.Model):
	PAYMENT_STATUS_CHOICES = [
		('Pending', 'Pending'),
		('Paid', 'Paid'),
	]

	DELIVERY_STATUS_CHOICES = [
		('Pending', 'Pending'),
		('Packed', 'Packed'),
		('Out for Delivery', 'Out for Delivery'),
		('Delivered', 'Delivered'),
	]

	patient_name = models.CharField(max_length=150)
	medicine = models.ForeignKey(MedicineStock, on_delete=models.SET_NULL, null=True, blank=True)
	medicine_name = models.CharField(max_length=200)
	quantity = models.PositiveIntegerField(default=1)
	order_date = models.DateField(auto_now_add=True)
	payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
	delivery_status = models.CharField(max_length=30, choices=DELIVERY_STATUS_CHOICES, default='Pending')
	total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

	def __str__(self):
		return f"{self.patient_name} - {self.medicine_name}"


class PaymentSummary(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	total_orders = models.PositiveIntegerField(default=0)
	total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)

	def __str__(self):
		return f"Summary {self.created_at.date()}"
