from django.conf import settings
from django.db import models

from patients.models import PatientProfile


class Department(models.Model):
    name = models.CharField(max_length=150, unique=True)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    """Stores doctor profile data (separate from user)."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    full_name = models.CharField(max_length=150)
    specialization = models.CharField(max_length=150)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors')
    license_no = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    experience_years = models.PositiveIntegerField(default=0)
    clinic_address = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='doctor_profiles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class ConsultationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Failed', 'Failed'),
    ]

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='consultation_requests')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='consultation_requests')
    symptoms = models.TextField()
    requested_at = models.DateTimeField(auto_now_add=True)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.patient.full_name} request ({self.status})"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='doctor_appointments')
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_appointments',
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.full_name} with {self.doctor.full_name}"


class Prescription(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='prescriptions')
    diagnosis = models.TextField()
    medicines = models.TextField()
    notes = models.TextField(blank=True)
    pdf = models.FileField(upload_to='prescriptions/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription for {self.patient.full_name}"
