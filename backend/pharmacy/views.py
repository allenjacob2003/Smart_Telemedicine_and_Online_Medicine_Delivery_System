from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import MedicineOrder, MedicineStock, PharmacyProfile
from .serializers import MedicineOrderSerializer, MedicineStockSerializer, PharmacyProfileSerializer

User = get_user_model()


def _get_pharmacy_user():
	return User.objects.filter(role='pharmacy').first()


def _get_or_create_profile():
	user = _get_pharmacy_user()
	if not user:
		return None
	profile, _ = PharmacyProfile.objects.get_or_create(
		user=user,
		defaults={
			'pharmacy_name': 'City Pharmacy',
			'location': 'Main Branch',
			'phone': '',
			'status': 'Active',
		},
	)
	return profile


@api_view(['GET'])
def dashboard_summary(request):
	orders = MedicineOrder.objects.all()
	total_orders = orders.count()
	pending_orders = orders.exclude(delivery_status='Delivered').count()
	delivered_orders = orders.filter(delivery_status='Delivered').count()
	total_revenue = orders.aggregate(total=Sum('total_price'))['total'] or 0
	
	# Recent orders for dashboard cards
	recent_orders = orders.order_by('-order_date', '-id')[:5]
	recent_orders_data = MedicineOrderSerializer(recent_orders, many=True).data
	
	# Low stock medicines
	low_stock = MedicineStock.objects.filter(
		available_quantity__lte=F('low_stock_threshold')
	).order_by('available_quantity')[:5]
	low_stock_data = MedicineStockSerializer(low_stock, many=True).data

	return Response({
		'total_orders': total_orders,
		'pending_deliveries': pending_orders,
		'delivered_orders': delivered_orders,
		'total_revenue': float(total_revenue),
		'recent_orders': recent_orders_data,
		'low_stock_medicines': low_stock_data,
	})


@api_view(['GET'])
def order_list(request):
	orders = MedicineOrder.objects.all().order_by('-order_date')

	date = request.GET.get('date')
	patient = request.GET.get('patient')
	status_filter = request.GET.get('delivery_status')

	if date:
		orders = orders.filter(order_date=date)
	if patient:
		orders = orders.filter(patient_name__icontains=patient)
	if status_filter:
		orders = orders.filter(delivery_status=status_filter)

	serializer = MedicineOrderSerializer(orders, many=True)
	return Response(serializer.data)


@api_view(['PUT'])
def update_order(request, pk):
	try:
		order = MedicineOrder.objects.get(pk=pk)
	except MedicineOrder.DoesNotExist:
		return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

	status_value = request.data.get('delivery_status')
	if not status_value:
		return Response({'detail': 'delivery_status is required.'}, status=status.HTTP_400_BAD_REQUEST)

	order.delivery_status = status_value
	order.save(update_fields=['delivery_status'])
	return Response(MedicineOrderSerializer(order).data)


@api_view(['GET'])
def payments_summary(request):
	orders = MedicineOrder.objects.all()
	total_orders = orders.count()
	total_revenue = orders.aggregate(total=Sum('total_price'))['total'] or 0
	
	# Orders by payment status
	paid_orders = orders.filter(payment_status='Paid').count()
	pending_payment_orders = orders.filter(payment_status='Pending').count()
	
	# Revenue by payment status
	paid_revenue = orders.filter(payment_status='Paid').aggregate(total=Sum('total_price'))['total'] or 0
	pending_revenue = orders.filter(payment_status='Pending').aggregate(total=Sum('total_price'))['total'] or 0

	seven_days_ago = timezone.now().date() - timezone.timedelta(days=6)
	series_qs = (
		orders.filter(order_date__gte=seven_days_ago)
		.annotate(date=TruncDate('order_date'))
		.values('date')
		.annotate(amount=Sum('total_price'))
		.order_by('date')
	)
	revenue_series = [
		{'date': item['date'].isoformat(), 'amount': float(item['amount'] or 0)}
		for item in series_qs
	]
	
	# Top selling medicines
	top_medicines = (
		orders.values('medicine_name')
		.annotate(
			total_quantity=Sum('quantity'),
			total_revenue=Sum('total_price'),
			order_count=Count('id')
		)
		.order_by('-total_quantity')[:5]
	)
	top_medicines_data = [
		{
			'medicine__name': item['medicine_name'],
			'total_quantity': item['total_quantity'] or 0,
			'total_revenue': float(item['total_revenue'] or 0),
			'order_count': item['order_count'] or 0,
		}
		for item in top_medicines
	]
	
	# Delivery status breakdown (just counts for pie chart)
	delivery_stats = orders.values('delivery_status').annotate(
		count=Count('id')
	)
	delivery_breakdown = {
		item['delivery_status']: item['count']
		for item in delivery_stats
	}

	return Response({
		'total_orders': total_orders,
		'total_revenue': float(total_revenue),
		'paid_orders': paid_orders,
		'pending_payments': pending_payment_orders,
		'paid_amount': float(paid_revenue),
		'pending_amount': float(pending_revenue),
		'revenue_series': revenue_series,
		'top_medicines': top_medicines_data,
		'delivery_breakdown': delivery_breakdown,
	})


@api_view(['GET'])
def stock_list(request):
	stocks = MedicineStock.objects.order_by('name')
	
	# Search filter
	search = request.GET.get('search', '').strip()
	if search:
		stocks = stocks.filter(name__icontains=search)
	
	# Category filter
	category = request.GET.get('category', '').strip()
	if category:
		stocks = stocks.filter(category__icontains=category)
	
	# Low stock filter
	low_stock = request.GET.get('low_stock', '').strip()
	if low_stock == 'true':
		stocks = stocks.filter(available_quantity__lte=F('low_stock_threshold'))
	
	serializer = MedicineStockSerializer(stocks, many=True)
	return Response(serializer.data)


@api_view(['POST'])
def add_medicine(request):
	serializer = MedicineStockSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_stock(request, pk):
	try:
		stock = MedicineStock.objects.get(pk=pk)
	except MedicineStock.DoesNotExist:
		return Response({'detail': 'Medicine not found.'}, status=status.HTTP_404_NOT_FOUND)

	quantity = request.data.get('available_quantity')
	if quantity is None:
		return Response({'detail': 'available_quantity is required.'}, status=status.HTTP_400_BAD_REQUEST)

	stock.available_quantity = int(quantity)
	stock.save(update_fields=['available_quantity'])
	return Response(MedicineStockSerializer(stock).data)


@api_view(['GET'])
def pharmacy_profile(request):
	profile = _get_or_create_profile()
	if not profile:
		return Response({'detail': 'Pharmacy user not found.'}, status=status.HTTP_404_NOT_FOUND)
	serializer = PharmacyProfileSerializer(profile)
	return Response(serializer.data)


