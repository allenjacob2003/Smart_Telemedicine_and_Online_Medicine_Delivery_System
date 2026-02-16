from rest_framework import serializers

from .models import MedicineOrder, MedicineStock, PaymentSummary, PharmacyProfile


class PharmacyProfileSerializer(serializers.ModelSerializer):
	email = serializers.EmailField(source='user.email', read_only=True)

	class Meta:
		model = PharmacyProfile
		fields = ['id', 'pharmacy_name', 'email', 'location', 'phone', 'status']


class MedicineStockSerializer(serializers.ModelSerializer):
	class Meta:
		model = MedicineStock
		fields = [
			'id',
			'name',
			'category',
			'price',
			'available_quantity',
			'low_stock_threshold',
			'expiry_date',
		]


class MedicineOrderSerializer(serializers.ModelSerializer):
	class Meta:
		model = MedicineOrder
		fields = [
			'id',
			'patient_name',
			'medicine',
			'medicine_name',
			'quantity',
			'order_date',
			'payment_status',
			'delivery_status',
			'total_price',
		]


class PaymentSummarySerializer(serializers.ModelSerializer):
	class Meta:
		model = PaymentSummary
		fields = ['id', 'created_at', 'total_orders', 'total_revenue']
