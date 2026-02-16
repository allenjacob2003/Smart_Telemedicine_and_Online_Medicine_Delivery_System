from decimal import Decimal

import razorpay
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from doctors.models import ConsultationRequest
from patients.models import PatientProfile
from pharmacy.models import MedicineOrder, MedicineStock
from .models import Payment

User = get_user_model()
logger = logging.getLogger(__name__)


def _get_patient_user(request):
	email = request.data.get('email') or request.data.get('patient_email') or request.GET.get('email')
	if not email:
		return None
	return User.objects.filter(email=email).first()


def _get_razorpay_client():
	key_id = getattr(settings, 'RAZORPAY_KEY_ID', None)
	key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', None)
	if not key_id or not key_secret:
		return None
	return razorpay.Client(auth=(key_id, key_secret))


def _send_payment_notification_email(payment_id, consultation_id):
	"""
	Send payment notification email to admin when consultation payment is successful.
	"""
	from django.core.mail import EmailMessage
	import logging
	
	logger = logging.getLogger(__name__)
	
	try:
		payment = Payment.objects.filter(id=payment_id).first()
		consultation = ConsultationRequest.objects.filter(
			id=consultation_id
		).select_related('patient', 'doctor', 'doctor__department').first()
		
		if not payment or not consultation:
			logger.warning(f"Payment notification: Could not find payment {payment_id} or consultation {consultation_id}")
			return
		
		admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@gmail.com')
		from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None)
		
		if not admin_email or not from_email:
			logger.warning("Admin email or sender email not configured")
			return
		
		patient_name = consultation.patient.full_name
		doctor_name = consultation.doctor.full_name
		department_name = consultation.doctor.department.name if consultation.doctor.department else 'General'
		consultation_fee = payment.amount
		razorpay_payment_id = payment.razorpay_payment_id
		
		subject = f"New Payment Received - Consultation with Dr. {doctor_name}"
		
		message = (
			f"A new payment has been received for a consultation.\n\n"
			f"Payment Details:\n"
			f"{'='*50}\n"
			f"Payment ID: {payment.id}\n"
			f"Razorpay Payment ID: {razorpay_payment_id}\n"
			f"Razorpay Order ID: {payment.razorpay_order_id}\n"
			f"Amount: ₹{consultation_fee}\n"
			f"Status: {payment.status.upper()}\n"
			f"Date: {payment.created_at}\n\n"
			f"Consultation Details:\n"
			f"{'='*50}\n"
			f"Consultation ID: {consultation.id}\n"
			f"Patient Name: {patient_name}\n"
			f"Patient Email: {consultation.patient.user.email}\n"
			f"Doctor Name: Dr. {doctor_name}\n"
			f"Department: {department_name}\n"
			f"Symptoms: {consultation.symptoms[:100]}...\n"
			f"Consultation Status: {consultation.status.upper()}\n"
			f"Payment Status: {consultation.payment_status}\n\n"
			f"{'='*50}\n"
			f"Please log in to the admin dashboard for more details.\n\n"
			f"Regards,\n"
			f"Smart Telemedicine System"
		)
		
		email = EmailMessage(
			subject=subject,
			body=message,
			from_email=from_email,
			to=[admin_email],
			reply_to=[from_email],
		)
		
		sent = email.send(fail_silently=False)
		logger.info(f"Payment notification email sent to {admin_email}: {sent}")
		return True
	except Exception as e:
		logger.error(f"Failed to send payment notification email: {str(e)}", exc_info=True)
		return False


def _send_pharmacy_order_notification_email(payment_id, order_ids):
	"""
	Send payment notification email to admin when pharmacy order payment is successful.
	"""
	from django.core.mail import EmailMessage
	import logging
	
	logger = logging.getLogger(__name__)
	
	try:
		logger.info(f"Starting pharmacy order email: payment_id={payment_id}, order_ids={order_ids}")
		
		payment = Payment.objects.filter(id=payment_id).first()
		if not payment:
			logger.warning(f"Pharmacy order notification: Could not find payment {payment_id}")
			return False
		
		logger.info(f"Found payment: {payment.id}, type: {payment.payment_type}")
		
		orders = list(MedicineOrder.objects.filter(id__in=order_ids).select_related('medicine'))
		logger.info(f"Found {len(orders)} orders")
		
		if not orders:
			logger.warning(f"Pharmacy order notification: Could not find orders {order_ids}")
			return False
		
		admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@gmail.com')
		from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None)
		
		logger.info(f"Admin email: {admin_email}, From email: {from_email}")
		
		if not admin_email or not from_email:
			logger.warning("Admin email or sender email not configured")
			return False
		
		patient_name = orders[0].patient_name if orders else 'Unknown'
		total_amount = payment.amount
		razorpay_payment_id = payment.razorpay_payment_id or 'N/A'
		
		# Build medicines list
		medicines_list = "\n".join([
			f"  • {order.medicine_name} - Qty: {order.quantity}, Price: ₹{order.total_price}"
			for order in orders
		])
		
		logger.info(f"Medicines list:\n{medicines_list}")
		
		subject = f"New Pharmacy Order Payment Received - {len(orders)} Item(s)"
		
		message = (
			f"A new payment has been received for a pharmacy order.\n\n"
			f"Payment Details:\n"
			f"{'='*50}\n"
			f"Payment ID: {payment.id}\n"
			f"Razorpay Payment ID: {razorpay_payment_id}\n"
			f"Razorpay Order ID: {payment.razorpay_order_id}\n"
			f"Amount: ₹{total_amount}\n"
			f"Status: {payment.status.upper()}\n"
			f"Date: {payment.created_at}\n\n"
			f"Order Details:\n"
			f"{'='*50}\n"
			f"Patient Name: {patient_name}\n"
			f"Total Items: {len(orders)}\n"
			f"Total Amount: ₹{total_amount}\n\n"
			f"Medicines Ordered:\n"
			f"{medicines_list}\n\n"
			f"Delivery Status: Pending\n"
			f"{'='*50}\n"
			f"Please log in to the admin dashboard for more details.\n\n"
			f"Regards,\n"
			f"Smart Telemedicine System"
		)
		
		logger.info(f"About to send email to {admin_email}")
		
		email = EmailMessage(
			subject=subject,
			body=message,
			from_email=from_email,
			to=[admin_email],
			reply_to=[from_email],
		)
		
		sent = email.send(fail_silently=False)
		logger.info(f"Pharmacy order notification email sent to {admin_email} with result: {sent}")
		return True
	except Exception as e:
		logger.error(f"Failed to send pharmacy order notification email: {str(e)}", exc_info=True)
		return False




@api_view(['GET'])
def payments_summary(request):
	consultation_qs = Payment.objects.filter(payment_type='consultation', status='success')
	consultation_count = consultation_qs.count()
	consultation_total = consultation_qs.aggregate(total=Sum('amount'))['total'] or 0

	pharmacy_qs = Payment.objects.filter(payment_type='pharmacy', status='success')
	pharmacy_count = pharmacy_qs.count()
	pharmacy_total = pharmacy_qs.aggregate(total=Sum('amount'))['total'] or 0

	return Response({
		'consultations': {
			'count': consultation_count,
			'total_amount': float(consultation_total),
		},
		'pharmacy': {
			'count': pharmacy_count,
			'total_amount': float(pharmacy_total),
		},
	})


@api_view(['GET'])
def payments_list(request):
	user = _get_patient_user(request)
	if not user:
		return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

	payments = Payment.objects.filter(patient=user).order_by('-created_at')
	data = [
		{
			'id': payment.id,
			'payment_type': payment.payment_type,
			'amount': float(payment.amount),
			'status': payment.status,
			'razorpay_order_id': payment.razorpay_order_id,
			'razorpay_payment_id': payment.razorpay_payment_id,
			'related_id': payment.related_id,
			'description': payment.description,
			'created_at': payment.created_at,
		}
		for payment in payments
	]
	return Response(data)


@api_view(['POST'])
def create_order(request):
	payment_type = request.data.get('payment_type')
	amount = request.data.get('amount')
	related_id = request.data.get('related_id')
	items = request.data.get('items')

	if payment_type not in ['consultation', 'pharmacy']:
		return Response({'detail': 'payment_type must be consultation or pharmacy.'}, status=status.HTTP_400_BAD_REQUEST)

	computed_amount = None
	if payment_type == 'pharmacy' and isinstance(items, list) and items:
		total = Decimal('0')
		for item in items:
			medicine_id = item.get('medicine_id')
			quantity = int(item.get('quantity', 1))
			if not medicine_id or quantity <= 0:
				return Response({'detail': 'Each item must include a valid medicine_id and quantity.'},
								status=status.HTTP_400_BAD_REQUEST)

			medicine = MedicineStock.objects.filter(pk=medicine_id).first()
			if not medicine:
				return Response({'detail': f'Medicine {medicine_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

			total += medicine.price * quantity

		computed_amount = total

	if amount is None and computed_amount is None:
		return Response({'detail': 'amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		amount_decimal = Decimal(str(computed_amount if computed_amount is not None else amount))
		amount_paise = int(amount_decimal * 100)
		if amount_paise <= 0:
			raise ValueError
	except (ValueError, TypeError):
		return Response({'detail': 'amount must be a positive number.'}, status=status.HTTP_400_BAD_REQUEST)

	if payment_type == 'consultation':
		if not related_id:
			return Response({'detail': 'related_id (consultation id) is required.'}, status=status.HTTP_400_BAD_REQUEST)
		consultation = ConsultationRequest.objects.filter(pk=related_id).first()
		if not consultation:
			return Response({'detail': 'Consultation request not found.'}, status=status.HTTP_404_NOT_FOUND)
		if consultation.status == 'rejected':
			return Response({'detail': 'Consultation request is rejected.'}, status=status.HTTP_400_BAD_REQUEST)

	client = _get_razorpay_client()
	if not client:
		return Response({'detail': 'Razorpay keys are not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	order = client.order.create({
		'amount': amount_paise,
		'currency': 'INR',
		'payment_capture': 1,
		'receipt': f"{payment_type}-{related_id or 'na'}",
	})

	return Response({
		'order_id': order.get('id'),
		'key': settings.RAZORPAY_KEY_ID,
		'amount': float(amount_decimal),
	})


@api_view(['POST'])
def verify_payment(request):
	payment_type = request.data.get('payment_type')
	amount = request.data.get('amount')
	related_id = request.data.get('related_id')
	razorpay_order_id = request.data.get('razorpay_order_id') or ''
	razorpay_payment_id = request.data.get('razorpay_payment_id') or ''
	
	logger.info(f"verify_payment called: payment_type={payment_type}, amount={amount}, related_id={related_id}")
	if payment_type not in ['consultation', 'pharmacy']:
		return Response({'detail': 'payment_type must be consultation or pharmacy.'}, status=status.HTTP_400_BAD_REQUEST)

	if amount is None:
		return Response({'detail': 'amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		amount_decimal = Decimal(str(amount))
	except (ValueError, TypeError):
		return Response({'detail': 'amount must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

	user = _get_patient_user(request)
	if not user:
		return Response({'detail': 'patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

	status_value = 'success' if razorpay_payment_id else 'failed'
	payment = None
	payment_id_to_notify = None
	created_orders = []

	with transaction.atomic():
		# Create payment description based on type
		description = ''
		if payment_type == 'consultation' and related_id:
			consultation = ConsultationRequest.objects.filter(pk=related_id).select_related('doctor', 'doctor__department').first()
			if consultation:
				dept_name = consultation.doctor.department.name if consultation.doctor.department else 'General'
				description = f"Consultation with Dr. {consultation.doctor.full_name} - {dept_name}"
		elif payment_type == 'pharmacy':
			description = f"Medicine Order Payment"

		payment = Payment.objects.create(
			patient=user,
			payment_type=payment_type,
			amount=amount_decimal,
			status=status_value,
			razorpay_order_id=razorpay_order_id,
			razorpay_payment_id=razorpay_payment_id,
			related_id=related_id,
			description=description,
		)

		if status_value != 'success':
			return Response({'detail': 'Payment failed.'}, status=status.HTTP_400_BAD_REQUEST)

		if payment_type == 'consultation':
			if not related_id:
				return Response({'detail': 'related_id (consultation id) is required.'}, status=status.HTTP_400_BAD_REQUEST)
			consultation = ConsultationRequest.objects.filter(pk=related_id).first()
			if not consultation:
				return Response({'detail': 'Consultation request not found.'}, status=status.HTTP_404_NOT_FOUND)

			consultation.payment_status = 'Paid'
			consultation.save(update_fields=['payment_status'])
			payment_id_to_notify = payment.id

		else:  # pharmacy payment
			items = request.data.get('items')
			if items is None:
				items = []
			if not items:
				medicine_id = related_id
				quantity = int(request.data.get('quantity', 1))
				if not medicine_id:
					return Response({'detail': 'related_id (medicine id) is required.'}, status=status.HTTP_400_BAD_REQUEST)
				items = [{'medicine_id': medicine_id, 'quantity': quantity}]

			patient_profile = PatientProfile.objects.filter(user=user).first()
			patient_name = patient_profile.full_name if patient_profile else user.email

			for item in items:
				medicine_id = item.get('medicine_id')
				quantity = int(item.get('quantity', 1))
				try:
					medicine = MedicineStock.objects.select_for_update().get(pk=medicine_id)
				except MedicineStock.DoesNotExist:
					return Response({'detail': f'Medicine {medicine_id} not found.'}, status=status.HTTP_404_NOT_FOUND)

				if medicine.available_quantity < quantity:
					return Response({'detail': f'Insufficient stock for {medicine.name}.'}, status=status.HTTP_400_BAD_REQUEST)

				medicine.available_quantity -= quantity
				medicine.save(update_fields=['available_quantity'])

				total_price = medicine.price * quantity
				order = MedicineOrder.objects.create(
					patient_name=patient_name,
					medicine=medicine,
					medicine_name=medicine.name,
					quantity=quantity,
					payment_status='Paid',
					delivery_status='Pending',
					total_price=total_price,
				)
				created_orders.append(order.id)

	# Send payment notification email OUTSIDE the transaction to avoid breaking the payment if email fails
	if payment_type == 'consultation' and payment_id_to_notify and related_id:
		logger.info(f"Sending consultation email for payment {payment_id_to_notify}")
		_send_payment_notification_email(payment_id_to_notify, related_id)
	elif payment_type == 'pharmacy' and payment and created_orders:
		logger.info(f"Sending pharmacy email: payment_type={payment_type}, payment={payment}, created_orders={created_orders}")
		_send_pharmacy_order_notification_email(payment.id, created_orders)
	else:
		logger.info(f"No email to send: payment_type={payment_type}, payment={payment}, payment_id_to_notify={payment_id_to_notify}, created_orders={created_orders}")

	# Return appropriate response based on payment type
	if payment_type == 'consultation':
		return Response({
			'detail': 'Payment verified for consultation.',
			'payment_id': payment.id,
		})
	else:
		return Response({
			'detail': 'Payment verified for pharmacy order.',
			'payment_id': payment.id,
			'orders': created_orders,
		})

