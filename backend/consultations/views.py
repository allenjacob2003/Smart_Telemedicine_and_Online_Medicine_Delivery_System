from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from doctors.models import Appointment
from .serializers import AppointmentSerializer


@api_view(['GET', 'POST'])
def appointment_list(request):
	if request.method == 'GET':
		appointments = Appointment.objects.select_related('patient', 'doctor', 'department').order_by('-created_at')
		data = [
			{
				'id': appointment.id,
				'patient_name': appointment.patient.full_name,
				'doctor_name': appointment.doctor.full_name,
				'department': appointment.department.name if appointment.department else '',
				'appointment_date': appointment.appointment_date,
				'appointment_time': appointment.appointment_time,
				'status': appointment.status,
				'created_at': appointment.created_at,
			}
			for appointment in appointments
		]
		return Response(data)

	serializer = AppointmentSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
