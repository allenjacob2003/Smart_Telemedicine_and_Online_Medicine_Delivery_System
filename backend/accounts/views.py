from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

import logging
import smtplib

from .serializers import (
    PatientLoginSerializer,
    RoleLoginSerializer,
    UserSerializer,
    PatientRegisterSerializer,
    DoctorCreateSerializer,
    AdminMessageSerializer,
    AdminMessageCreateSerializer,
)
from patients.models import PatientProfile
from doctors.models import DoctorProfile
from doctors.models import Department
from .models import AdminMessage

User = get_user_model()

logger = logging.getLogger(__name__)

def _get_display_name(user):
    if user.role == 'patient':
        profile = PatientProfile.objects.filter(user=user).only('full_name').first()
        if profile and profile.full_name:
            return profile.full_name
    if user.role == 'doctor':
        profile = DoctorProfile.objects.filter(user=user).only('full_name').first()
        if profile and profile.full_name:
            return profile.full_name
    return user.email

def _login_payload(user):
    return {
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'display_name': _get_display_name(user),
    }

@api_view(['POST'])
def patient_login(request):
    """Login for patients (email + password only)."""
    serializer = PatientLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Email not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({'detail': 'Invalid password.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.role != 'patient':
        return Response({'detail': 'Not a patient account.'}, status=status.HTTP_403_FORBIDDEN)

    if not user.is_active:
        return Response({
            'detail': 'Your account has been blocked. Please contact the administrator for assistance.',
            'blocked': True,
            'contact_email': 'admin@smartmed.com',
            'contact_phone': '+1-800-SMARTMED'
        }, status=status.HTTP_403_FORBIDDEN)

    return Response(_login_payload(user))


@api_view(['POST'])
def role_login(request):
    """Login for doctor/pharmacy/admin (email + password + role)."""
    serializer = RoleLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    role = serializer.validated_data['role']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'Email not found.'}, status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({'detail': 'Invalid password.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.role != role:
        return Response({'detail': 'Selected role does not match.'}, status=status.HTTP_403_FORBIDDEN)

    if user.role in {'admin', 'pharmacy'} and not user.is_active:
        user.is_active = True
        user.save(update_fields=['is_active'])

    if not user.is_active:
        return Response({'detail': 'Account blocked'}, status=status.HTTP_403_FORBIDDEN)

    return Response(_login_payload(user))


@api_view(['POST'])
def patient_register(request):
    """Register a patient account."""
    serializer = PatientRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    email = data['email']

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'User already registered, please login'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = User.objects.create_user(
            email=email,
            password=data['password'],
            role='patient',
        )
        PatientProfile.objects.create(
            user=user,
            full_name=data['name'],
            phone=data['phone'],
            gender=data.get('gender', ''),
            age=data.get('age'),
        )

    return Response({
        'message': 'Registration successful',
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def create_doctor(request):
    """Create a doctor account (admin-only in UI)."""
    serializer = DoctorCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    email = data['email']

    if User.objects.filter(email=email).exists():
        return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = User.objects.create_user(
            email=email,
            password=data['password'],
            role='doctor',
        )
        user.is_active = True
        user.save(update_fields=['is_active'])
        department_name = data.get('department')
        department = None
        if department_name:
            department, _ = Department.objects.get_or_create(name=department_name)

        DoctorProfile.objects.create(
            user=user,
            full_name=data['name'],
            specialization=data['specialization'],
            phone=data['phone'],
            license_no='N/A',
            department=department,
        )

    email_sent = False
    email_error = None
    email_error_type = None
    email_debug = None

    try:
        _send_doctor_welcome_email(
            doctor_name=data['name'],
            to_email=email,
            raw_password=data['password'],
        )
        email_sent = True
    except Exception as e:
        email_error_type = type(e).__name__
        if isinstance(e, smtplib.SMTPAuthenticationError):
            email_error = (
                "SMTP authentication failed (Gmail rejected the username/password). "
                "If you're using Gmail, configure 2-Step Verification and use an App Password for EMAIL_HOST_PASSWORD."
            )
        else:
            email_error = str(e)

        # Full traceback in server logs (best place to see the real reason)
        print(f"EMAIL ERROR: {e}") # Debugging
        logger.exception("Doctor welcome email failed", extra={
            "to_email": email,
            "email_debug": _safe_email_debug(),
        })

        # Optional: return safe diagnostics to frontend for debugging (no secrets)
        email_debug = _safe_email_debug()

    return Response({
        'message': 'Doctor created successfully',
        'email_sent': email_sent,
        'email_error': email_error,
        'email_error_type': email_error_type,
        'email_debug': email_debug if not email_sent else None,
        'user': UserSerializer(user).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def admin_patient_list(request):
    profiles = PatientProfile.objects.select_related('user').all()
    data = [
        {
            'id': profile.user.id,
            'profile_id': profile.id,
            'name': profile.full_name,
            'email': profile.user.email,
            'phone': profile.phone,
            'is_active': profile.user.is_active,
        }
        for profile in profiles
    ]
    return Response(data)


@api_view(['PATCH'])
def admin_patient_status(request, user_id):
    try:
        user = User.objects.get(id=user_id, role='patient')
    except User.DoesNotExist:
        return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_active = request.data.get('is_active')
    if is_active is None:
        return Response({'detail': 'is_active is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(is_active, str):
        is_active = is_active.strip().lower() in {'true', '1', 'yes'}
    user.is_active = bool(is_active)
    user.save()
    return Response({'id': user.id, 'is_active': user.is_active})


@api_view(['GET'])
def admin_doctor_list(request):
    profiles = DoctorProfile.objects.select_related('user', 'department').all()
    data = [
        {
            'id': profile.user.id,
            'profile_id': profile.id,
            'name': profile.full_name,
            'email': profile.user.email,
            'phone': profile.phone,
            'specialization': profile.specialization,
            'department': profile.department.name if profile.department else '',
            'is_active': profile.user.is_active,
        }
        for profile in profiles
    ]
    return Response(data)


@api_view(['PATCH'])
def admin_doctor_status(request, user_id):
    try:
        user = User.objects.get(id=user_id, role='doctor')
    except User.DoesNotExist:
        return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_active = request.data.get('is_active')
    if is_active is None:
        return Response({'detail': 'is_active is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(is_active, str):
        is_active = is_active.strip().lower() in {'true', '1', 'yes'}
    user.is_active = bool(is_active)
    user.save()
    return Response({'id': user.id, 'is_active': user.is_active})


@api_view(['DELETE'])
def admin_patient_delete(request, user_id):
    """Delete a patient and their profile."""
    try:
        user = User.objects.get(id=user_id, role='patient')
    except User.DoesNotExist:
        return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Delete user (profile will cascade delete due to OneToOne relationship)
    user_email = user.email
    user.delete()
    return Response({'detail': f'Patient {user_email} deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def admin_doctor_delete(request, user_id):
    """Delete a doctor and their profile."""
    try:
        user = User.objects.get(id=user_id, role='doctor')
    except User.DoesNotExist:
        return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Delete user (profile will cascade delete due to OneToOne relationship)
    user_email = user.email
    user.delete()
    return Response({'detail': f'Doctor {user_email} deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def admin_messages(request):
    if request.method == 'GET':
        messages = AdminMessage.objects.select_related('user').order_by('-created_at')
        serializer = AdminMessageSerializer(messages, many=True)
        return Response(serializer.data)

    serializer = AdminMessageCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    message_text = serializer.validated_data['message']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    message = AdminMessage.objects.create(user=user, message=message_text)
    return Response(AdminMessageSerializer(message).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def test_email(request):
    """Debug endpoint: send a test email to verify SMTP config works."""
    to_email = request.data.get('email')
    if not to_email:
        return Response({'detail': 'email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    from django.conf import settings
    from django.core.mail import EmailMessage

    debug_info = _safe_email_debug()

    try:
        email = EmailMessage(
            subject='Test Email - Smart Telemedicine',
            body='If you received this, email sending is working correctly.',
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None),
            to=[to_email],
        )
        sent = email.send(fail_silently=False)
        return Response({
            'success': sent == 1,
            'sent': sent,
            'debug': debug_info,
        })
    except Exception as e:
        logger.exception("Test email failed")
        return Response({
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
            'debug': debug_info,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _safe_email_debug():
    """Return non-secret email configuration to quickly spot misconfiguration."""
    from django.conf import settings
    return {
        "EMAIL_BACKEND": getattr(settings, "EMAIL_BACKEND", None),
        "EMAIL_HOST": getattr(settings, "EMAIL_HOST", None),
        "EMAIL_PORT": getattr(settings, "EMAIL_PORT", None),
        "EMAIL_USE_TLS": getattr(settings, "EMAIL_USE_TLS", None),
        "EMAIL_USE_SSL": getattr(settings, "EMAIL_USE_SSL", None),
        "EMAIL_HOST_USER": getattr(settings, "EMAIL_HOST_USER", None),
        "DEFAULT_FROM_EMAIL": getattr(settings, "DEFAULT_FROM_EMAIL", None),
    }

def _send_doctor_welcome_email(*, doctor_name: str, to_email: str, raw_password: str) -> None:
    """
    Sends email from the configured SMTP sender (EMAIL_HOST_USER).
    Raises exception if configuration is missing or send fails.
    """
    from django.conf import settings
    from django.core.mail import EmailMessage

    # Prefer DEFAULT_FROM_EMAIL if you configured it, otherwise fall back to EMAIL_HOST_USER
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None)

    # SMTP auth still typically depends on EMAIL_HOST_USER being present in settings
    smtp_user = getattr(settings, 'EMAIL_HOST_USER', None)
    smtp_password = getattr(settings, 'EMAIL_HOST_PASSWORD', None)

    if not smtp_user:
        raise ValueError(
            "EMAIL_HOST_USER is not configured (SMTP username). "
            "Check that your .env file exists and load_dotenv() can find it."
        )

    if not smtp_password:
        raise ValueError(
            "EMAIL_HOST_PASSWORD is not configured (SMTP app password). "
            "Check that your .env file exists and load_dotenv() can find it."
        )

    if not from_email:
        raise ValueError("DEFAULT_FROM_EMAIL/EMAIL_HOST_USER is not configured. Set a sender email.")

    logger.info(
        "Attempting to send doctor welcome email: host=%s, port=%s, tls=%s, ssl=%s, user=%s, from=%s, to=%s",
        getattr(settings, 'EMAIL_HOST', None),
        getattr(settings, 'EMAIL_PORT', None),
        getattr(settings, 'EMAIL_USE_TLS', None),
        getattr(settings, 'EMAIL_USE_SSL', None),
        smtp_user,
        from_email,
        to_email,
    )

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    login_url = f"{frontend_url.rstrip('/')}/role/login"

    subject = "Welcome – Smart Telemedicine System (Doctor Account Created)"
    message = (
        f"Hello Dr. {doctor_name},\n\n"
        "Your doctor account has been created in the Smart Telemedicine and Online Medicine Delivery System.\n\n"
        "Login details:\n"
        f"Email: {to_email}\n"
        f"Password: {raw_password}\n\n"
        f"Login URL: {login_url}\n\n"
        "Regards,\n"
        "Admin Team\n"
        "Smart Telemedicine System"
    )

    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=from_email,
        to=[to_email],
        reply_to=[from_email],
    )
    sent = email.send(fail_silently=False)
    logger.info("Email send result: %s", sent)
    if sent != 1:
        raise RuntimeError(f"Email backend returned sent={sent} (expected 1).")
