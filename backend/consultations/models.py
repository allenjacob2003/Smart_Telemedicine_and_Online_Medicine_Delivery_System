from django.db import models

from patients.models import PatientProfile
from doctors.models import DoctorProfile, Department


class Appointment(models.Model):
	patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
	doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
	department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
	appointment_date = models.DateField()
	appointment_time = models.TimeField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.patient.full_name} with {self.doctor.full_name}"
