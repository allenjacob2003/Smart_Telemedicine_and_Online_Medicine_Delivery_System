from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
	patient_name = serializers.CharField(source='patient.full_name', read_only=True)
	doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)
	department_name = serializers.CharField(source='department.name', read_only=True)

	class Meta:
		model = Appointment
		fields = [
			'id',
			'patient',
			'doctor',
			'department',
			'appointment_date',
			'appointment_time',
			'patient_name',
			'doctor_name',
			'department_name',
			'created_at',
		]
