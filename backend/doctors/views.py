from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from patients.models import PatientProfile
from .models import Appointment, ConsultationRequest, DoctorProfile, Department, Prescription
from .serializers import (
    AppointmentSerializer,
    ConsultationRequestSerializer,
    DoctorProfileSerializer,
    PatientSummarySerializer,
    PrescriptionSerializer,
)


def _get_doctor_profile(request):
    email = request.GET.get('email') or request.data.get('email') or request.data.get('doctor_email')
    if not email:
        return None
    return DoctorProfile.objects.select_related('user', 'department').filter(user__email=email).first()


@api_view(['GET', 'POST'])
def doctor_profile_list(request):
    """List or create doctor profiles."""
    if request.method == 'GET':
        profiles = DoctorProfile.objects.all()
        serializer = DoctorProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    serializer = DoctorProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def doctor_profile_detail(request, pk):
    """Retrieve, update, or delete a doctor profile."""
    try:
        profile = DoctorProfile.objects.get(pk=pk)
    except DoctorProfile.DoesNotExist:
        return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DoctorProfileSerializer(profile)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = DoctorProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    profile.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def department_list(request):
    departments = Department.objects.annotate(doctor_count=Count('doctors')).order_by('name')
    data = [
        {
            'id': dept.id,
            'name': dept.name,
            'doctor_count': dept.doctor_count,
        }
        for dept in departments
    ]
    return Response(data)


@api_view(['GET'])
def doctors_by_department(request):
    """Get doctors associated with a specific department."""
    department_id = request.GET.get('department_id')
    department_name = request.GET.get('department_name')
    
    if not department_id and not department_name:
        return Response({'detail': 'department_id or department_name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    filters = {}
    if department_id:
        filters['department_id'] = department_id
    if department_name:
        filters['department__name__iexact'] = department_name
    
    doctors = DoctorProfile.objects.filter(**filters).select_related('department').order_by('full_name')
    data = [
        {
            'id': doctor.id,
            'full_name': doctor.full_name,
            'specialization': doctor.specialization,
            'experience_years': doctor.experience_years,
            'phone': doctor.phone,
        }
        for doctor in doctors
    ]
    return Response(data)


@api_view(['GET'])
def confirmed_appointments(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    appointments = Appointment.objects.filter(doctor=doctor, status='confirmed').select_related(
        'patient', 'department'
    )
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def consultation_requests(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    requests = ConsultationRequest.objects.filter(doctor=doctor, status='pending').select_related('patient')
    serializer = ConsultationRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def approve_request(request, pk):
    try:
        consultation = ConsultationRequest.objects.select_related('doctor', 'patient', 'doctor__department').get(pk=pk)
    except ConsultationRequest.DoesNotExist:
        return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

    consultation.status = 'approved'
    consultation.save(update_fields=['status'])

    # Use preferred date/time if provided, otherwise fall back to requested_at
    if consultation.preferred_date:
        appointment_date = consultation.preferred_date
    else:
        appointment_date = consultation.requested_at.date() if consultation.requested_at else timezone.now().date()
    
    if consultation.preferred_time:
        appointment_time = consultation.preferred_time
    else:
        appointment_time = consultation.requested_at.time() if consultation.requested_at else timezone.now().time()

    Appointment.objects.create(
        patient=consultation.patient,
        doctor=consultation.doctor,
        department=consultation.doctor.department,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        status='confirmed',
    )

    return Response({'detail': 'Request approved.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def reject_request(request, pk):
    try:
        consultation = ConsultationRequest.objects.get(pk=pk)
    except ConsultationRequest.DoesNotExist:
        return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)

    consultation.status = 'rejected'
    consultation.save(update_fields=['status'])
    return Response({'detail': 'Request rejected.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def search_patient(request):
    name = request.GET.get('name', '').strip()
    if not name:
        return Response([], status=status.HTTP_200_OK)

    patients = PatientProfile.objects.filter(full_name__icontains=name).select_related('user')
    serializer = PatientSummarySerializer(patients, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def upload_prescription(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    patient_id = request.data.get('patient_id')
    if not patient_id:
        return Response({'detail': 'patient_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        patient = PatientProfile.objects.get(pk=patient_id)
    except PatientProfile.DoesNotExist:
        return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)

    prescription = Prescription.objects.create(
        patient=patient,
        doctor=doctor,
        diagnosis=request.data.get('diagnosis', ''),
        medicines=request.data.get('medicines', ''),
        notes=request.data.get('notes', ''),
        pdf=request.FILES.get('pdf'),
    )

    serializer = PrescriptionSerializer(prescription)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def prescription_history(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    prescriptions = Prescription.objects.filter(doctor=doctor).select_related('patient').order_by('-created_at')
    serializer = PrescriptionSerializer(prescriptions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def doctor_profile(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = DoctorProfileSerializer(doctor)
    return Response(serializer.data)


@api_view(['PUT'])
def doctor_profile_update(request):
    doctor = _get_doctor_profile(request)
    if not doctor:
        return Response({'detail': 'Doctor email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()

    department_name = data.get('department') or data.get('department_name')
    if department_name:
        department, _ = Department.objects.get_or_create(name=department_name)
        doctor.department = department

    doctor.full_name = data.get('name') or data.get('full_name') or doctor.full_name
    doctor.specialization = data.get('specialization') or doctor.specialization
    doctor.phone = data.get('phone') or data.get('phone_number') or doctor.phone

    if data.get('email'):
        doctor.user.email = data.get('email')
        doctor.user.save(update_fields=['email'])

    password = data.get('password')
    if password:
        doctor.user.set_password(password)
        doctor.user.save()

    # Handle image upload
    image_data = request.data.get('profile_image')
    if image_data is not None:
        if image_data and image_data != 'null' and image_data != '':
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # Extract base64 string and create file
                import base64
                from django.core.files.base import ContentFile
                
                try:
                    format_part, imgstr = image_data.split(';base64,')
                    ext = format_part.split('/')[-1]
                    decoded_data = base64.b64decode(imgstr)
                    from django.utils.text import slugify
                    file_name = f"doctor_{doctor.id}_{slugify(doctor.full_name)}.{ext}"
                    doctor.profile_image.save(file_name, ContentFile(decoded_data), save=False)
                except Exception as e:
                    return Response({'detail': f'Error processing image: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Handle file upload
                doctor.profile_image = image_data
        else:
            # Remove image if empty/null
            if doctor.profile_image:
                doctor.profile_image.delete()
            doctor.profile_image = None

    doctor.save()

    serializer = DoctorProfileSerializer(doctor)
    return Response(serializer.data)
