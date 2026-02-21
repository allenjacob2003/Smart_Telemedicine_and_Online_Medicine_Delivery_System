"""
Django settings for telemedicine project.
"""

from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Explicitly point to the .env file in the backend root
load_dotenv(dotenv_path=BASE_DIR / '.env')

# SECRET_KEY = 'django-insecure-change-this-key'
SECRET_KEY = os.getenv('SECRET_KEY','3)d3&ye9bxh_61@-g(9tdqq2pvp^mc&ur18*f7$)ee7he0epw0')

DEBUG = False

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'accounts',
    'patients',
    'doctors',
    'consultations',
    'pharmacy',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'telemedicine.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'telemedicine.wsgi.application'

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'telemedicine_db',
#         'USER': 'root',
#         'PASSWORD': 'allen2003',
#         'HOST': 'localhost',
#         'PORT': '3307',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('MYSQLDATABASE'),
        'USER': os.environ.get('MYSQLUSER'),
        'PASSWORD': os.environ.get('MYSQLPASSWORD'),
        'HOST': os.environ.get('MYSQLHOST'),
        'PORT': os.environ.get('MYSQLPORT'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

CORS_ALLOW_ALL_ORIGINS = True

AUTH_USER_MODEL = 'accounts.User'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Fixed system users (override via environment variables)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@gmail.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
PHARMACY_EMAIL = os.environ.get('PHARMACY_EMAIL', 'pharmacy@telemedicine.local')
PHARMACY_PASSWORD = os.environ.get('PHARMACY_PASSWORD', 'pharmacy123')

# Razorpay Test Mode Keys (override via environment variables)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")


EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False  # Must be False when EMAIL_USE_TLS is True

EMAIL_HOST_USER = (os.getenv("EMAIL_HOST_USER") or "").strip() or None
EMAIL_HOST_PASSWORD = (os.getenv("EMAIL_HOST_PASSWORD") or "").strip() or None


DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Validate email config at startup so misconfigurations surface early
if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
    import warnings
    warnings.warn(
        f"Email credentials not loaded from .env (looked at {BASE_DIR / '.env'}). "
        f"EMAIL_HOST_USER={'set' if EMAIL_HOST_USER else 'MISSING'}, "
        f"EMAIL_HOST_PASSWORD={'set' if EMAIL_HOST_PASSWORD else 'MISSING'}. "
        "Doctor welcome emails will fail.",
        stacklevel=1,
    )

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

