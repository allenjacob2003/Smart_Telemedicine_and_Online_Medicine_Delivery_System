import os
import sys
import django

# Add the project root to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'telemedicine.settings')
django.setup()

from accounts.views import _send_doctor_welcome_email
from django.conf import settings

def test_send_email():
    print("Testing doctor welcome email...")
    to_email = settings.EMAIL_HOST_USER
    if not to_email:
        print("Error: EMAIL_HOST_USER is not set in settings.")
        return

    print(f"Sending to: {to_email}")
    try:
        _send_doctor_welcome_email(
            doctor_name="Test Doctor",
            to_email=to_email,
            raw_password="testpassword123"
        )
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_send_email()
