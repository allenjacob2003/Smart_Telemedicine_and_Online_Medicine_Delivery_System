from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.utils import timezone
from doctors.models import Appointment, ConsultationRequest, Department, DoctorProfile, Prescription
from pharmacy.models import MedicineOrder, MedicineStock
from .models import PatientProfile
from .serializers import PatientProfileSerializer
from decimal import Decimal

DEFAULT_CONSULTATION_FEE = Decimal('300')

def _get_patient_profile(request):
    email = request.GET.get('email') or request.data.get('email')
    if not email:
        return None
    return PatientProfile.objects.select_related('user').filter(user__email=email).first()


@api_view(['GET', 'POST'])
def patient_profile_list(request):
    """List or create patient profiles."""
    if request.method == 'GET':
        profiles = PatientProfile.objects.all()
        serializer = PatientProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    serializer = PatientProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def patient_profile_detail(request, pk):
    """Retrieve, update, or delete a patient profile."""
    try:
        profile = PatientProfile.objects.get(pk=pk)
    except PatientProfile.DoesNotExist:
        return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PatientProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = PatientProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    profile.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def dashboard_summary(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    total_requests = ConsultationRequest.objects.filter(patient=patient).count()
    confirmed_appointments = Appointment.objects.filter(patient=patient, status='confirmed').count()
    prescriptions_received = Prescription.objects.filter(patient=patient).count()

    active_orders = MedicineOrder.objects.filter(patient_name__iexact=patient.full_name).exclude(
        delivery_status='Delivered'
    ).count()

    return Response({
        'total_requests': total_requests,
        'confirmed_appointments': confirmed_appointments,
        'prescriptions_received': prescriptions_received,
        'active_orders': active_orders,
    })


@api_view(['POST'])
def consultation_request(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    department_name = request.data.get('department')
    doctor_id = request.data.get('doctor_id')
    symptoms = request.data.get('symptoms')
    preferred_date = request.data.get('preferred_date')
    preferred_time = request.data.get('preferred_time')
    fee = request.data.get('fee')

    if not department_name or not symptoms:
        return Response({'detail': 'department and symptoms are required.'}, status=status.HTTP_400_BAD_REQUEST)

    department = Department.objects.filter(name__iexact=department_name).first()
    if not department:
        return Response({'detail': 'Department not found.'}, status=status.HTTP_404_NOT_FOUND)

    # If doctor_id is provided, use it; otherwise get the first available doctor
    if doctor_id:
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id, department=department)
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found in the selected department.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        doctor = DoctorProfile.objects.filter(department=department).first()

    if not doctor:
        return Response({'detail': 'No doctor available for this department.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        consultation_fee = Decimal(str(fee)) if fee is not None else DEFAULT_CONSULTATION_FEE
    except (ValueError, TypeError):
        consultation_fee = DEFAULT_CONSULTATION_FEE

    request_obj = ConsultationRequest.objects.create(
        patient=patient,
        doctor=doctor,
        symptoms=symptoms,
        preferred_date=preferred_date or None,
        preferred_time=preferred_time or None,
        status='pending',
        consultation_fee=consultation_fee,
        payment_status='Pending',
    )

    return Response(
        {
            'id': request_obj.id,
            'status': request_obj.status,
            'consultation_fee': str(request_obj.consultation_fee),
            'payment_status': request_obj.payment_status,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def confirmed_appointments(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    appointments = Appointment.objects.filter(patient=patient, status='confirmed').select_related(
        'doctor', 'department'
    )
    data = [
        {
            'id': appointment.id,
            'doctor_name': appointment.doctor.full_name,
            'department': appointment.department.name if appointment.department else '',
            'appointment_date': appointment.appointment_date,
            'appointment_time': appointment.appointment_time,
            'status': appointment.status,
        }
        for appointment in appointments
    ]
    return Response(data)


@api_view(['GET'])
def consultation_requests_list(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    requests = ConsultationRequest.objects.filter(patient=patient).select_related('doctor', 'doctor__department').order_by('-requested_at')
    data = [
        {
            'id': req.id,
            'doctor_name': req.doctor.full_name,
            'department': req.doctor.department.name if req.doctor.department else '',
            'symptoms': req.symptoms,
            'requested_at': req.requested_at,
            'preferred_date': req.preferred_date,
            'preferred_time': req.preferred_time,
            'status': req.status,
            'consultation_fee': float(req.consultation_fee),
            'payment_status': req.payment_status,
        }
        for req in requests
    ]
    return Response(data)


@api_view(['GET'])
def prescriptions(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    prescriptions_qs = Prescription.objects.filter(patient=patient).select_related('doctor').order_by('-created_at')
    data = [
        {
            'id': prescription.id,
            'doctor_name': prescription.doctor.full_name,
            'date_issued': prescription.created_at,
            'medicines': prescription.medicines,
            'notes': prescription.notes,
            'pdf': prescription.pdf.url if prescription.pdf else '',
        }
        for prescription in prescriptions_qs
    ]
    return Response(data)


@api_view(['POST'])
def place_order(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    items = request.data.get('items', [])
    if not isinstance(items, list) or not items:
        return Response({'detail': 'items list is required.'}, status=status.HTTP_400_BAD_REQUEST)

    created_orders = []
    for item in items:
        medicine_id = item.get('medicine_id')
        quantity = int(item.get('quantity', 1))

        try:
            medicine = MedicineStock.objects.get(pk=medicine_id)
        except MedicineStock.DoesNotExist:
            continue

        total_price = medicine.price * quantity
        order = MedicineOrder.objects.create(
            patient_name=patient.full_name,
            medicine=medicine,
            medicine_name=medicine.name,
            quantity=quantity,
            total_price=total_price,
            payment_status='Pending',
            delivery_status='Pending',
        )
        created_orders.append(order.id)

    return Response({'orders': created_orders}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_orders(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    orders = MedicineOrder.objects.filter(patient_name__iexact=patient.full_name).order_by('-order_date')
    data = [
        {
            'id': order.id,
            'medicine_name': order.medicine_name,
            'quantity': order.quantity,
            'total_price': float(order.total_price),
            'order_date': order.order_date,
            'delivery_status': order.delivery_status,
            'payment_status': order.payment_status,
        }
        for order in orders
    ]
    return Response(data)


@api_view(['GET'])
def patient_profile(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = PatientProfileSerializer(patient, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def patient_profile_update(request):
    patient = _get_patient_profile(request)
    if not patient:
        return Response({'detail': 'Patient email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Get the image data if provided
    image_data = request.data.get('profile_image')
    
    # Only update profile fields that are provided, don't touch name/phone etc if not changing
    if 'name' in request.data:
        patient.full_name = request.data.get('name')
    if 'phone' in request.data:
        patient.phone = request.data.get('phone')
    if 'age' in request.data:
        patient.age = request.data.get('age')
    if 'gender' in request.data:
        patient.gender = request.data.get('gender')
    
    # Handle image upload
    if image_data is not None:  # Check if image_data is in the request
        if image_data and image_data != 'null' and image_data != '':
            # Check if it's a base64 string
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # Extract base64 string and create file
                import base64
                from django.core.files.base import ContentFile
                
                try:
                    format_part, imgstr = image_data.split(';base64,')
                    ext = format_part.split('/')[-1]
                    decoded_data = base64.b64decode(imgstr)
                    from django.utils.text import slugify
                    file_name = f"patient_{patient.id}_{slugify(patient.full_name)}.{ext}"
                    patient.profile_image.save(file_name, ContentFile(decoded_data), save=False)
                except Exception as e:
                    return Response({'detail': f'Error processing image: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Handle file upload
                patient.profile_image = image_data
        else:
            # Remove image if empty/null
            if patient.profile_image:
                patient.profile_image.delete()
            patient.profile_image = None
    
    patient.save()

    # Return updated profile with image URL
    serializer = PatientProfileSerializer(patient, context={'request': request})
    return Response(serializer.data)

