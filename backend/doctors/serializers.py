from rest_framework import serializers

from patients.models import PatientProfile
from .models import Appointment, ConsultationRequest, DoctorProfile, Prescription


class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = '__all__'

    def get_department_name(self, obj):
        return obj.department.name if obj.department else ''


class PatientSummarySerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'full_name', 'email', 'phone']


class ConsultationRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    request_date = serializers.SerializerMethodField()
    request_time = serializers.SerializerMethodField()
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_status = serializers.CharField(max_length=20)

    class Meta:
        model = ConsultationRequest
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'symptoms',
            'status',
            'requested_at',
            'preferred_date',
            'preferred_time',
            'request_date',
            'request_time',
            'consultation_fee',
            'payment_status',
        ]

    def get_request_date(self, obj):
        # Use preferred_date if available, otherwise fall back to requested_at
        if obj.preferred_date:
            return obj.preferred_date.isoformat()
        return obj.requested_at.date().isoformat() if obj.requested_at else ''

    def get_request_time(self, obj):
        # Use preferred_time if available, otherwise fall back to requested_at
        if obj.preferred_time:
            return obj.preferred_time.strftime('%H:%M')
        return obj.requested_at.strftime('%H:%M') if obj.requested_at else ''


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'department',
            'department_name',
            'appointment_date',
            'appointment_time',
            'status',
        ]


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    date_issued = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'diagnosis',
            'medicines',
            'notes',
            'pdf',
            'date_issued',
        ]
