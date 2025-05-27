import os
import certifi
from twilio.rest import Client as TwilioClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, To
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio

# Import the config object (for API keys, hardcoded public info)
from ..config import config
# Import the function to fetch dynamic settings from DB
from ..database.supabase_client import fetch_admin_notification_settings

# Fix SSL certificate verification error for SendGrid/Requests
os.environ['SSL_CERT_FILE'] = certifi.where()

# --- Helper Functions (_get_valid_recipients - unchanged) ---
def _get_valid_recipients(recipients: list[str | None]) -> list[str]:
    return [r.strip() for r in recipients if r and r.strip()]

# --- Email Sending (SendGrid - uses config for keys/sender, hardcoded name) ---
async def send_email_sendgrid(to_emails: list[str] | str, subject: str, html_content: str):
    if not config.SENDGRID_API_KEY or not config.SENDGRID_FROM_EMAIL: # Check config for keys
        print("ERROR: SendGrid API Key or From Email not configured.")
        return False
    # ... (rest of validation logic) ...
    valid_recipients = _get_valid_recipients([to_emails] if isinstance(to_emails, str) else to_emails)
    if not valid_recipients: return False
    sg_recipients = [To(email) for email in valid_recipients]

    message = Mail(
        from_email=(config.COMPANY_NAME, config.SENDGRID_FROM_EMAIL), # Use hardcoded name, config sender
        to_emails=sg_recipients,
        subject=subject,
        html_content=html_content
    )
    try:
        # ... (rest of sending logic) ...
        print(f"📤 Sending email via SendGrid to: {valid_recipients}")
        sg = SendGridAPIClient(config.SENDGRID_API_KEY)
        response = await asyncio.to_thread(sg.send, message)
        print(f"✅ SendGrid Email sent! Status Code: {response.status_code}")
        return 200 <= response.status_code < 300
    except Exception as e:
        print(f"❌ SendGrid Error: {type(e).__name__} - {e}")
        return False


# --- Email Sending (SMTP - uses config for keys/sender, hardcoded name) ---
async def send_email_smtp(to_emails: list[str] | str, subject: str, body: str):
    if not config.GMAIL_SENDER_EMAIL or not config.GMAIL_APP_PASSWORD: # Check config for keys
        print("ERROR: Gmail Sender Email or App Password not configured.")
        return False
    # ... (rest of validation logic) ...
    valid_recipients = _get_valid_recipients([to_emails] if isinstance(to_emails, str) else to_emails)
    if not valid_recipients: return False

    sender_display_name = config.COMPANY_NAME # Use hardcoded name

    message = MIMEMultipart()
    message["From"] = f"{sender_display_name} <{config.GMAIL_SENDER_EMAIL}>"
    message["To"] = ", ".join(valid_recipients)
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        # ... (rest of sending logic) ...
        print(f"📤 Sending email via SMTP to: {valid_recipients}")
        def smtp_task():
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(config.GMAIL_SENDER_EMAIL, config.GMAIL_APP_PASSWORD)
                server.sendmail(config.GMAIL_SENDER_EMAIL, valid_recipients, message.as_string())
        await asyncio.to_thread(smtp_task)
        print("✅ SMTP Email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        return False

# --- SMS Sending (Twilio - uses config for keys/sender - unchanged) ---
async def send_sms_twilio(to_numbers: list[str] | str, body: str):
    if not config.TWILIO_ACCOUNT_SID or not config.TWILIO_AUTH_TOKEN or not config.TWILIO_FROM_NUMBER:
        print("ERROR: Twilio credentials or From Number not configured.")
        return False
    # ... (rest of function unchanged) ...
    valid_recipients = _get_valid_recipients([to_numbers] if isinstance(to_numbers, str) else to_numbers)
    if not valid_recipients: return False
    client = TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
    success_count = 0
    for number in valid_recipients:
        try:
            print(f"📲 Sending SMS via Twilio to: {number}")
            message = await asyncio.to_thread(
                client.messages.create,
                from_=config.TWILIO_FROM_NUMBER,
                body=body,
                to=number
            )
            print(f"✅ Twilio SMS sent to {number}! SID: {message.sid}")
            success_count += 1
        except Exception as e:
            print(f"❌ Twilio SMS Error to {number}: {type(e).__name__} - {e}")
    return success_count > 0


# --- WhatsApp Sending (Twilio - uses config for keys/sender - unchanged) ---
async def send_whatsapp_twilio(to_numbers: list[str] | str, body: str):
    if not config.TWILIO_ACCOUNT_SID or not config.TWILIO_AUTH_TOKEN or not config.TWILIO_FROM_NUMBER:
        print("ERROR: Twilio credentials or From Number not configured.")
        return False
    # ... (rest of function unchanged) ...
    valid_recipients = _get_valid_recipients([to_numbers] if isinstance(to_numbers, str) else to_numbers)
    if not valid_recipients: return False
    client = TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
    success_count = 0
    for number in valid_recipients:
        whatsapp_number = f"whatsapp:{number}" if not number.startswith('whatsapp:') else number
        twilio_whatsapp_sender = f"whatsapp:{config.TWILIO_FROM_NUMBER}" if not config.TWILIO_FROM_NUMBER.startswith('whatsapp:') else config.TWILIO_FROM_NUMBER
        try:
            print(f"💬 Sending WhatsApp via Twilio to: {whatsapp_number}")
            message = await asyncio.to_thread(
                client.messages.create,
                 from_=twilio_whatsapp_sender,
                 body=body,
                 to=whatsapp_number
            )
            print(f"✅ Twilio WhatsApp sent to {whatsapp_number}! SID: {message.sid}")
            success_count += 1
        except Exception as e:
            print(f"❌ Twilio WhatsApp Error to {whatsapp_number}: {type(e).__name__} - {e}")
    return success_count > 0

# --- Admin Notification Logic (Fetches settings from DB again) ---

async def notify_admins(subject: str, message_body: str, html_message_body: str | None = None):
    """Sends notifications to admins based on settings fetched from the database."""
    print("Fetching admin notification settings from database...")
    settings = await fetch_admin_notification_settings() # Fetch from DB
    if not settings:
        print("ERROR: Could not fetch admin notification settings.")
        return

    tasks = []
    # Use fetched settings
    email_recipients = _get_valid_recipients(settings.get('email_recipients', []))
    sms_recipients = _get_valid_recipients(settings.get('sms_recipients', []))
    whatsapp_recipients = _get_valid_recipients(settings.get('whatsapp_recipients', []))

    # Email
    if settings.get('email_enabled') and email_recipients:
        # Use config for API keys/sender details
        if config.SENDGRID_API_KEY and config.SENDGRID_FROM_EMAIL:
            tasks.append(send_email_sendgrid(email_recipients, subject, html_message_body or message_body))
        elif config.GMAIL_SENDER_EMAIL and config.GMAIL_APP_PASSWORD:
             tasks.append(send_email_smtp(email_recipients, subject, message_body))
        else:
            print("WARN: Admin email enabled but no provider (SendGrid/SMTP) configured in config.py.")
    elif settings.get('email_enabled'):
         print("WARN: Admin email enabled in DB but no valid recipients found in DB.")

    # SMS
    if settings.get('sms_enabled') and sms_recipients:
        # Use config for API keys/sender details
        if config.TWILIO_ACCOUNT_SID and config.TWILIO_AUTH_TOKEN and config.TWILIO_FROM_NUMBER:
            tasks.append(send_sms_twilio(sms_recipients, message_body))
        else:
             print("WARN: Admin SMS enabled but Twilio not configured in config.py.")
    elif settings.get('sms_enabled'):
         print("WARN: Admin SMS enabled in DB but no valid recipients found in DB.")

    # WhatsApp
    if settings.get('whatsapp_enabled') and whatsapp_recipients:
         # Use config for API keys/sender details
        if config.TWILIO_ACCOUNT_SID and config.TWILIO_AUTH_TOKEN and config.TWILIO_FROM_NUMBER:
            tasks.append(send_whatsapp_twilio(whatsapp_recipients, message_body))
        else:
            print("WARN: Admin WhatsApp enabled but Twilio not configured in config.py.")
    elif settings.get('whatsapp_enabled'):
         print("WARN: Admin WhatsApp enabled in DB but no valid recipients found in DB.")

    if tasks:
        print(f"Attempting to send admin notifications for: {subject}")
        await asyncio.gather(*tasks)
    else:
        print("INFO: No admin notifications sent (either disabled in DB or no valid recipients found in DB/config).")


# --- Customer Notification Logic (Uses hardcoded COMPANY_NAME from config) ---
# (These functions remain largely the same as they primarily use config for sender details)

async def notify_customer_registration(email: str):
    subject = f"Welcome to {config.COMPANY_NAME}!" # Use hardcoded name
    html_body = f"<p>Hi,</p><p>Thanks for registering at {config.COMPANY_NAME}. Please check your inbox for a confirmation link if required.</p><p>Regards,<br>The {config.COMPANY_NAME} Team</p>"
    # Decide which email provider to use based on config
    if config.SENDGRID_API_KEY:
        await send_email_sendgrid([email], subject, html_body)
    elif config.GMAIL_SENDER_EMAIL:
        await send_email_smtp([email], subject, f"Hi,\n\nThanks for registering at {config.COMPANY_NAME}. Please check your inbox for a confirmation link if required.\n\nRegards,\nThe {config.COMPANY_NAME} Team")

async def notify_customer_order_placed(email: str, order_number: str):
    subject = f"Your {config.COMPANY_NAME} Order #{order_number} Confirmed" # Use hardcoded name
    html_body = f"<p>Hi,</p><p>Your order {order_number} has been placed successfully. We'll notify you when it ships.</p><p>Regards,<br>The {config.COMPANY_NAME} Team</p>"
    if config.SENDGRID_API_KEY:
        await send_email_sendgrid([email], subject, html_body)
    elif config.GMAIL_SENDER_EMAIL:
         await send_email_smtp([email], subject, f"Hi,\n\nYour order {order_number} has been placed successfully. We'll notify you when it ships.\n\nRegards,\nThe {config.COMPANY_NAME} Team")


async def notify_customer_item_shipped(email: str, order_number: str, item_name: str, eta_days: int | None):
    subject = f"An item from your {config.COMPANY_NAME} Order #{order_number} has shipped!" # Use hardcoded name
    eta_text = f" Estimated delivery in {eta_days} days." if eta_days else ""
    html_body = f"<p>Hi,</p><p>Good news! Your item '{item_name}' from order {order_number} has shipped.{eta_text}</p><p>Regards,<br>The {config.COMPANY_NAME} Team</p>"
    if config.SENDGRID_API_KEY:
        await send_email_sendgrid([email], subject, html_body)
    elif config.GMAIL_SENDER_EMAIL:
        await send_email_smtp([email], subject, f"Hi,\n\nGood news! Your item '{item_name}' from order {order_number} has shipped.{eta_text}\n\nRegards,\nThe {config.COMPANY_NAME} Team")