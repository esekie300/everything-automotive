import os
from supabase import create_client, Client
# Import config to get the database keys
from ..config import config

# Global Supabase client instance (using Anon Key for most operations)
supabase_anon: Client | None = None
# Global Supabase client instance (using Service Role Key - USE WITH CAUTION)
supabase_service: Client | None = None

def init_supabase_client():
    """Initializes the Supabase clients."""
    global supabase_anon, supabase_service
    url: str = config.SUPABASE_URL
    key: str = config.SUPABASE_KEY
    service_key: str | None = config.SUPABASE_SERVICE_KEY

    if not url or not key:
        raise ValueError("Supabase URL and Key must be set in environment variables.")

    print("Initializing Supabase Anon Client...")
    supabase_anon = create_client(url, key)
    print("Supabase Anon Client Initialized.")

    if service_key:
        print("Initializing Supabase Service Client...")
        supabase_service = create_client(url, service_key)
        print("Supabase Service Client Initialized.")
    else:
         print("Supabase Service Key not found, Service Client not initialized.")

def get_supabase_anon_client() -> Client:
    """Returns the initialized Supabase client (Anon Key)."""
    if supabase_anon is None:
        raise RuntimeError("Supabase Anon client not initialized. Call init_supabase_client() first.")
    return supabase_anon

def get_supabase_service_client() -> Client | None:
    """
    Returns the initialized Supabase client (Service Role Key).
    Returns None if the service key was not provided.
    USE WITH EXTREME CAUTION. Bypasses RLS.
    """
    return supabase_service

# --- RESTORED HELPER FUNCTIONS ---

async def fetch_site_info(key: str) -> str | None:
    """Fetches a specific value from the site_information table."""
    client = get_supabase_anon_client() # Use anon client if RLS allows reading needed keys
    try:
        # Ensure RLS allows reading the necessary keys (e.g., make notification keys public read or allow service_role)
        response = await client.table('site_information')\
                             .select('info_value')\
                             .eq('info_key', key)\
                             .limit(1)\
                             .execute()
        if response.data:
            return response.data[0]['info_value']
        print(f"WARN: Site info key '{key}' not found in database.")
        return None
    except Exception as e:
        print(f"Error fetching site info for key '{key}': {e}")
        return None

async def fetch_multiple_site_info(keys: list[str]) -> dict[str, str | None]:
    """Fetches multiple values from the site_information table."""
    client = get_supabase_anon_client() # Use anon client if RLS allows reading needed keys
    results = {key: None for key in keys}
    if not keys:
        return results
    try:
        # Ensure RLS allows reading the necessary keys
        response = await client.table('site_information')\
                             .select('info_key, info_value')\
                             .in_('info_key', keys)\
                             .execute()
        if response.data:
            for item in response.data:
                results[item['info_key']] = item['info_value']
        # Log warnings for keys not found
        for key in keys:
            if results[key] is None:
                 print(f"WARN: Site info key '{key}' not found in database.")
        return results
    except Exception as e:
        print(f"Error fetching multiple site info for keys '{keys}': {e}")
        return results # Return dict with Nones for failed keys

async def fetch_admin_notification_settings() -> dict:
    """Fetches all relevant admin notification settings and recipients from DB."""
    # Use the keys defined in config.py
    keys_to_fetch = [
        config.ADMIN_NOTIFY_SMS_ENABLED_KEY,
        config.ADMIN_NOTIFY_WHATSAPP_ENABLED_KEY,
        config.ADMIN_NOTIFY_EMAIL_ENABLED_KEY,
        *config.ADMIN_SMS_RECIPIENT_KEYS,
        *config.ADMIN_WHATSAPP_RECIPIENT_KEYS,
        *config.ADMIN_EMAIL_RECIPIENT_KEYS,
    ]

    db_values = await fetch_multiple_site_info(keys_to_fetch)

    settings = {
        'sms_enabled': db_values.get(config.ADMIN_NOTIFY_SMS_ENABLED_KEY, 'false').lower() == 'true',
        'whatsapp_enabled': db_values.get(config.ADMIN_NOTIFY_WHATSAPP_ENABLED_KEY, 'false').lower() == 'true',
        'email_enabled': db_values.get(config.ADMIN_NOTIFY_EMAIL_ENABLED_KEY, 'false').lower() == 'true',
        'sms_recipients': [db_values.get(k) for k in config.ADMIN_SMS_RECIPIENT_KEYS if db_values.get(k)],
        'whatsapp_recipients': [db_values.get(k) for k in config.ADMIN_WHATSAPP_RECIPIENT_KEYS if db_values.get(k)],
        'email_recipients': [db_values.get(k) for k in config.ADMIN_EMAIL_RECIPIENT_KEYS if db_values.get(k)],
    }
    return settings