from rest_framework import serializers
import base64
from django.core.files.base import ContentFile
from .models import PatientProfile


class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProfile
        fields = ('id', 'full_name', 'email', 'phone', 'gender', 'age', 'address', 'city', 'state', 'pincode', 'profile_image', 'created_at')
        read_only_fields = ('email', 'created_at', 'id')
    
    def get_email(self, obj):
        return obj.user.email
    
    def get_profile_image(self, obj):
        if obj.profile_image:
            # Return just the relative URL path, not the absolute URL
            # This allows the frontend to use it correctly
            return obj.profile_image.url
        return None
    
    def create(self, validated_data):
        return PatientProfile.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
