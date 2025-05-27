import os
from dotenv import load_dotenv

# Load environment variables from .env file located in the same directory
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    """Base configuration with hardcoded public info and DB keys for notifications."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_fallback_secret_key')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'

    # --- Secrets loaded from .env ---
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
    SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER')
    SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
    SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL', 'no-reply@everything-automotive.com')
    GMAIL_SENDER_EMAIL = os.environ.get('GMAIL_SENDER_EMAIL')
    GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    EMAIL_CONFIRMATION_REDIRECT_URL = os.environ.get('EMAIL_CONFIRMATION_REDIRECT_URL', f'{FRONTEND_URL}/login')

    # --- Hardcoded Public-Facing Site Information ---
    COMPANY_NAME = "Everything Automotive"
    COMPANY_MISSION = "To be the leading provider of quality automotive parts and services in Nigeria, leveraging technology and expertise."
    LAGOS_HEAD_OFFICE_ADDRESS = "5 Adejuwon Street, Ikotun, Lagos State Nigeria" # Example
    EDO_BRANCH_ADDRESS = "4 Harrison Street, Idokpa Quarters, Edo State, Nigeria" # Example
    MAIN_PHONE = "+2348138900104" # Example - Use actual
    MAIN_EMAIL = "esekiegabriel@gmail.com" # Example - Use actual
    SUPPORT_EMAIL = "helpassist121@gmail.com" # Example - Use actual
    SUPPORT_PHONE = "+2347025631853" # Example - Use actual
    SERVICE_OVERVIEW = "We offer a wide range of automotive services including routine maintenance, complex repairs, diagnostics, tire services, body work, HVAC, and electrical repairs. We also provide a marketplace for vehicle parts and vehicles."

    # --- Database Keys for Dynamic Site Information (e.g., Notifications) ---
    # These keys MUST match the 'info_key' values in your 'site_information' table
    ADMIN_NOTIFY_SMS_ENABLED_KEY = 'admin_notify_sms_enabled'
    ADMIN_NOTIFY_WHATSAPP_ENABLED_KEY = 'admin_notify_whatsapp_enabled'
    ADMIN_NOTIFY_EMAIL_ENABLED_KEY = 'admin_notify_email_enabled'
    ADMIN_SMS_RECIPIENT_KEYS = ['admin_notification_sms_1', 'admin_notification_sms_2', 'admin_notification_sms_3']
    ADMIN_WHATSAPP_RECIPIENT_KEYS = ['admin_notification_whatsapp_1', 'admin_notification_whatsapp_2', 'admin_notification_whatsapp_3']
    ADMIN_EMAIL_RECIPIENT_KEYS = ['admin_notification_email_1', 'admin_notification_email_2', 'admin_notification_email_3']
    # Add other keys here if needed, e.g., MAIN_EMAIL_KEY = 'main_email' if you decide to fetch it instead

# Export an instance
config = Config()