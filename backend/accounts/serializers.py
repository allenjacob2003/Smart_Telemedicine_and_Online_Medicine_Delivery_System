from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active']


class PatientLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RoleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)


class PatientRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    age = serializers.IntegerField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)


class DoctorCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    specialization = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    department = serializers.CharField(max_length=150)


from .models import AdminMessage


class AdminMessageSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_phone = serializers.SerializerMethodField()

    class Meta:
        model = AdminMessage
        fields = ['id', 'user_email', 'user_role', 'user_phone', 'message', 'created_at']

    def get_user_phone(self, obj):
        """Get phone number from the related profile based on user role."""
        user = obj.user
        if user.role == 'patient':
            if hasattr(user, 'patient_profile'):
                return user.patient_profile.phone
        elif user.role == 'doctor':
            if hasattr(user, 'doctor_profile'):
                return user.doctor_profile.phone
        return None


class AdminMessageCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    message = serializers.CharField()
