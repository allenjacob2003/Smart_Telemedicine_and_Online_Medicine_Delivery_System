from django.apps import AppConfig
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        try:
            User = get_user_model()

            admin_email = getattr(settings, 'ADMIN_EMAIL', None)
            admin_password = getattr(settings, 'ADMIN_PASSWORD', None)
            if admin_email and admin_password and not User.objects.filter(email=admin_email).exists():
                User.objects.create_superuser(email=admin_email, password=admin_password)

            pharmacy_email = getattr(settings, 'PHARMACY_EMAIL', None)
            pharmacy_password = getattr(settings, 'PHARMACY_PASSWORD', None)
            if pharmacy_email and pharmacy_password and not User.objects.filter(email=pharmacy_email).exists():
                User.objects.create_user(
                    email=pharmacy_email,
                    password=pharmacy_password,
                    role='pharmacy',
                )
        except OperationalError:
            pass
