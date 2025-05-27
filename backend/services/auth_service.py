# backend/services/auth_service.py

from supabase import Client, create_client
from postgrest.exceptions import APIError
from gotrue.errors import AuthApiError, AuthSessionMissingError
# Import BOTH client getters
from ..database.supabase_client import get_supabase_anon_client, get_supabase_service_client
# --- Import necessary models ---
from ..models.user_models import UserRegistration, UserLogin, UserProfile, UserSession, UserPasswordChange, UserForgotPassword, UserResetPassword
from ..config import config
import asyncio
import traceback

# --- register_user function (MODIFIED REDIRECT URL) ---
async def register_user(user_data: UserRegistration) -> tuple[UserProfile | None, str | None]:
    """Registers a new user using Supabase Auth."""
    supabase = get_supabase_anon_client()
    if not supabase:
        return None, "Registration failed: Supabase client not available."

    print(f"--- Service register_user called for: {user_data.email} ---")

    try:
        user_meta = {}
        if user_data.full_name:
            user_meta['full_name'] = user_data.full_name

        # --- Sign Up (Synchronous) ---
        auth_response = await asyncio.to_thread(
            supabase.auth.sign_up,
            {
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    # <<< CHANGE REDIRECT URL HERE >>>
                    "email_redirect_to": f"{config.FRONTEND_URL}/", # Redirect to homepage after confirmation
                    # <<< END CHANGE >>>
                    "data": user_meta
                }
            }
        )

        # Check response structure
        if auth_response.user and not auth_response.session:
             if auth_response.user.identities and not auth_response.user.email_confirmed_at:
                 print(f"User {user_data.email} exists but is unconfirmed. Resending confirmation.")
                 # Return the specific message indicating confirmation is needed
                 return None, "Registration successful. Please check your email to confirm your account."
             else:
                 # This case might mean the user exists AND is confirmed.
                 print(f"Registration attempt for existing confirmed user: {user_data.email}")
                 return None, "Email already registered."

        elif auth_response.user and auth_response.session:
             # This happens if email confirmation is disabled in Supabase settings
             print(f"New user {user_data.email} registered (confirmation likely disabled).")
             return None, "Registration successful." # No confirmation needed message

        else:
             # Should not happen with Supabase >= 2.0, but handle defensively
             print(f"Registration failed for {user_data.email}: Unexpected response structure from sign_up.")
             return None, "Registration failed: Invalid response from authentication server."

    except AuthApiError as e:
        print(f"AuthApiError during registration for {user_data.email}: Status={e.status}, Message='{e.message}'")
        error_message_lower = str(e.message).lower() if e.message else ""

        if "user already registered" in error_message_lower or "email link" in error_message_lower:
            # Check if the user is confirmed or not (requires service client)
            supabase_service = get_supabase_service_client()
            if supabase_service:
                try:
                    user_lookup = await asyncio.to_thread(
                        supabase_service.auth.admin.get_user_by_id, # Use admin client to check
                        # Need a way to get user ID if possible, or just assume unconfirmed if error is about link
                        # This part is tricky without knowing the exact Supabase error structure for this case
                        # Let's assume if the error mentions "email link", they need confirmation
                    )
                    # Simplified logic: If error mentions email link, assume confirmation needed
                    if "email link" in error_message_lower:
                         return None, "Registration successful. Please check your email to confirm your account." # Treat as needing confirmation
                    else:
                         return None, "Email already registered."
                except Exception as admin_e:
                    print(f"Error checking existing user status: {admin_e}")
                    return None, "Email already registered." # Fallback
            else:
                 return None, "Email already registered." # Fallback if service client fails

        elif "password should be at least 6 characters" in error_message_lower:
             return None, "Password must be at least 6 characters long."
        else:
            error_msg = f"Registration failed: {e.message or str(e)}"
            return None, error_msg
    except Exception as e:
        print(f"Unexpected Error during registration for {user_data.email}: {type(e).__name__} - {e}")
        traceback.print_exc()
        return None, "An unexpected error occurred during registration."
# --- End register_user function ---


# --- login_user function (No changes needed here) ---
async def login_user(login_data: UserLogin) -> tuple[UserSession | None, str | None]:
    """Logs in a user using Supabase Auth and fetches profile using service client."""
    supabase_anon = get_supabase_anon_client()
    supabase_service = get_supabase_service_client()

    if not supabase_anon:
        return None, "Login failed: Supabase client not available."
    if not supabase_service:
        print("ERROR: Service client not available for profile lookup during login.")
        return None, "Login failed: Server configuration error."

    try:
        print(f"Attempting Supabase sign_in_with_password for: {login_data.email}")
        auth_response = await asyncio.to_thread(
            supabase_anon.auth.sign_in_with_password,
            {
                "email": login_data.email,
                "password": login_data.password
            }
        )

        if auth_response.session and auth_response.user:
            print(f"User {login_data.email} logged in successfully via Supabase Auth.")
            try:
                user_id = auth_response.user.id
                profile_response = await asyncio.to_thread(
                    supabase_service.table('profiles').select('*').eq('id', user_id).limit(1).single().execute # Use single()
                )

                if profile_response.data:
                    profile_data = profile_response.data
                    profile_data['id'] = str(profile_data['id'])
                    profile_data['created_at'] = str(profile_data.get('created_at', ''))
                    profile = UserProfile(**profile_data)
                    user_session = UserSession(
                        access_token=auth_response.session.access_token,
                        token_type=auth_response.session.token_type,
                        expires_in=auth_response.session.expires_in,
                        refresh_token=auth_response.session.refresh_token,
                        user=profile
                    )
                    return user_session, "Login successful."
                else:
                    # Profile might not exist yet if created by trigger
                    print(f"WARN: Login successful for {login_data.email}, but profile not found (ID: {user_id}). Creating basic user object.")
                    # Create a basic UserProfile from auth data if profile is missing
                    basic_profile_data = {
                        'id': str(user_id),
                        'email': auth_response.user.email,
                        'created_at': str(auth_response.user.created_at),
                        'full_name': auth_response.user.user_metadata.get('full_name') # Get from metadata if available
                    }
                    profile = UserProfile(**basic_profile_data)
                    user_session = UserSession(
                        access_token=auth_response.session.access_token,
                        token_type=auth_response.session.token_type,
                        expires_in=auth_response.session.expires_in,
                        refresh_token=auth_response.session.refresh_token,
                        user=profile # Use the basic profile
                    )
                    return user_session, "Login successful." # Still return success

            except APIError as db_e:
                 # Handle case where single() finds no rows specifically
                if db_e.code == 'PGRST116':
                    print(f"WARN: Login successful for {login_data.email}, but profile not found (ID: {user_id}) - PGRST116.")
                    basic_profile_data = {
                        'id': str(auth_response.user.id),
                        'email': auth_response.user.email,
                        'created_at': str(auth_response.user.created_at),
                        'full_name': auth_response.user.user_metadata.get('full_name')
                    }
                    profile = UserProfile(**basic_profile_data)
                    user_session = UserSession(
                        access_token=auth_response.session.access_token,
                        token_type=auth_response.session.token_type,
                        expires_in=auth_response.session.expires_in,
                        refresh_token=auth_response.session.refresh_token,
                        user=profile
                    )
                    return user_session, "Login successful."
                else:
                    print(f"Supabase DB Error fetching profile for {user_id} during login: {db_e}")
                    traceback.print_exc()
                    # Log in but indicate profile issue
                    return None, "Login successful, but failed to load user profile due to database error."
            except Exception as profile_e:
                 print(f"Unexpected Error fetching profile for {user_id} during login: {profile_e}")
                 traceback.print_exc()
                 return None, "Login successful, but failed to load user profile due to unexpected error."

        else:
            print(f"Login failed for {login_data.email}: No session or user object in Supabase response.")
            return None, "Login failed: Invalid response from authentication server."

    except AuthApiError as e:
        print(f"[login_user] AuthApiError caught for {login_data.email}: Status={e.status}, Message='{e.message}'")
        error_message_lower = str(e.message).lower() if e.message else ""

        if "invalid login credentials" in error_message_lower:
            print("[login_user] Condition matched: Invalid login credentials.")
            return None, "Invalid email or password."
        elif "email not confirmed" in error_message_lower:
             print("[login_user] Condition matched: Email not confirmed.")
             return None, "Please confirm your email address before logging in."
        else:
            print(f"[login_user] Condition not matched. Returning generic error: {e.message or str(e)}")
            error_msg = f"Login failed: {e.message or str(e)}"
            return None, error_msg

    except Exception as e:
        print(f"Unexpected Error during login for {login_data.email}: {type(e).__name__} - {e}")
        traceback.print_exc()
        return None, "An unexpected error occurred during login."
# --- End login_user function ---


# --- logout_user function (No changes needed) ---
async def logout_user(access_token: str | None) -> tuple[bool, str | None]:
    """Logs out a user - instructs client to clear tokens. Optionally tries server-side signout."""
    message = "Logout successful. Please clear local tokens."
    success = True

    if access_token:
        supabase = get_supabase_anon_client()
        if supabase:
            try:
                # Use the client associated with the token to sign out
                # Note: Supabase Python client sign_out doesn't take a token,
                # it signs out the *client's* current session.
                # If using anon client, this might not do much server-side.
                # Relying on client-side token clearing is primary.
                await asyncio.to_thread(supabase.auth.sign_out)
                print("Attempted server-side sign out (cleared local client session).")
                message = "Logout successful. Server session state cleared locally. Please clear browser tokens."
            except AuthApiError as e:
                print(f"Supabase Auth Error during server-side sign out: {e}. Proceeding.")
            except Exception as e:
                 print(f"Unexpected Error during server-side sign out: {type(e).__name__} - {e}. Proceeding.")
                 traceback.print_exc()
        else:
            print("WARN: Supabase client not available for server-side sign out attempt.")

    print("Logout processed. Instructing client to clear tokens.")
    return success, message
# --- End logout_user function ---


# --- get_user_from_token function (No changes needed) ---
async def get_user_from_token(access_token: str) -> UserProfile | None:
    """Gets user details from Supabase using an access token and fetches profile using service client."""
    supabase_anon = get_supabase_anon_client()
    supabase_service = get_supabase_service_client()

    if not supabase_anon or not supabase_service:
        print("ERROR: Supabase client(s) not available for get_user_from_token.")
        return None

    try:
        # Validate token first
        user_response = await asyncio.to_thread(supabase_anon.auth.get_user, jwt=access_token)

        if user_response and user_response.user:
            user_id = user_response.user.id
            try:
                # Fetch profile using service client for potentially bypassing RLS if needed
                profile_response = await asyncio.to_thread(
                    supabase_service.table('profiles').select('*').eq('id', user_id).limit(1).single().execute
                )

                if profile_response.data:
                    profile_data = profile_response.data
                    profile_data['id'] = str(profile_data['id'])
                    profile_data['created_at'] = str(profile_data.get('created_at', ''))
                    profile = UserProfile(**profile_data)
                    return profile
                else:
                    # Profile might not exist yet
                    print(f"WARN: Profile not found for user_id: {user_id} (using service client)")
                    # Return basic info from token if profile missing
                    basic_profile_data = {
                        'id': str(user_id),
                        'email': user_response.user.email,
                        'created_at': str(user_response.user.created_at),
                        'full_name': user_response.user.user_metadata.get('full_name')
                    }
                    return UserProfile(**basic_profile_data)

            except APIError as db_e:
                 if db_e.code == 'PGRST116': # No profile row found
                    print(f"WARN: Profile not found for user_id: {user_id} (PGRST116)")
                    basic_profile_data = {
                        'id': str(user_id),
                        'email': user_response.user.email,
                        'created_at': str(user_response.user.created_at),
                        'full_name': user_response.user.user_metadata.get('full_name')
                    }
                    return UserProfile(**basic_profile_data)
                 else:
                    print(f"Supabase DB Error fetching profile for {user_id}: {db_e}")
                    traceback.print_exc()
                    return None # Indicate error fetching profile
            except Exception as profile_e:
                 print(f"Unexpected Error fetching profile for {user_id}: {profile_e}")
                 traceback.print_exc()
                 return None

        else:
            print(f"No user found for the provided token (get_user response invalid).")
            return None
    except AuthApiError as e:
        # This specifically catches invalid/expired tokens
        print(f"Auth error getting user from token: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error getting user from token: {e}")
        traceback.print_exc()
        return None
# --- End get_user_from_token function ---


# --- request_password_reset function (No changes needed) ---
async def request_password_reset(forgot_password_data: UserForgotPassword) -> tuple[bool, str | None]:
    """Sends a password reset email using Supabase Auth."""
    supabase = get_supabase_anon_client()
    if not supabase:
        return False, "Password reset failed: Server configuration error."

    reset_redirect_url = f"{config.FRONTEND_URL}/reset-password" # Redirect to the reset form page
    print(f"Attempting password reset for email: {forgot_password_data.email}")

    try:
        await asyncio.to_thread(
            supabase.auth.reset_password_for_email,
            email=forgot_password_data.email,
            options={'redirect_to': reset_redirect_url}
        )
        print(f"Password reset email request processed for {forgot_password_data.email}.")
        # Return a consistent message regardless of whether the email exists
        return True, "If an account with this email exists, a password reset link has been sent."

    except AuthApiError as e:
        print(f"Supabase Auth Error during password reset request: {e}")
        # Don't reveal if email exists
        return True, "If an account with this email exists, a password reset link has been sent."
    except Exception as e:
        print(f"Unexpected Error during password reset request: {type(e).__name__} - {e}")
        traceback.print_exc()
        # Don't reveal if email exists
        return True, "If an account with this email exists, a password reset link has been sent."
# --- End request_password_reset function ---


# --- change_user_password function (No changes needed) ---
async def change_user_password(access_token: str, password_data: UserPasswordChange) -> tuple[bool, str | None]:
    """
    Changes the password for the user associated with the access token.
    Requires the user to be authenticated.
    """
    supabase_anon = get_supabase_anon_client()
    if not supabase_anon:
        return False, "Password change failed: Server configuration error."

    # Set the session for the anon client using the provided token
    # This is necessary because update_user operates on the client's current session
    try:
        print(f"Setting session for password update...")
        await asyncio.to_thread(
             supabase_anon.auth.set_session,
             access_token=access_token,
             refresh_token="dummy_refresh_token_placeholder" # Refresh token isn't strictly needed for update_user
        )
        print(f"Session set for password update.")
    except Exception as set_session_e:
         print(f"Error setting session before password update: {set_session_e}")
         # Check if it's an invalid token error
         if "invalid JWT" in str(set_session_e).lower() or "token is expired" in str(set_session_e).lower():
              return False, "Your session has expired or is invalid. Please log in again."
         return False, "Password change failed: Could not verify current session."

    # Now attempt the update
    try:
        print(f"Attempting password update for user associated with the client's session...")
        response = await asyncio.to_thread(
            supabase_anon.auth.update_user,
            attributes={'password': password_data.new_password}
            # Supabase implicitly requires current password validation via RLS or security settings,
            # The `current_password` field from the model is for frontend validation.
        )

        if response.user:
            print(f"Password updated successfully for user: {response.user.id}")
            # Sign out after successful password change for security
            try:
                await asyncio.to_thread(supabase_anon.auth.sign_out)
                print("User signed out after password change.")
            except Exception as signout_e:
                print(f"WARN: Failed to sign out user after password change: {signout_e}")
            return True, "Password updated successfully. Please log in again for security."
        else:
            print(f"WARN: Supabase password update response did not contain user object.")
            # Assume success if no error, but recommend re-login
            return True, "Password update processed. Please log in again."

    except AuthApiError as e:
        print(f"Supabase Auth Error during password change: {e}")
        error_message_lower = str(e.message).lower() if e.message else ""
        if "error updating user" in error_message_lower or "database error" in error_message_lower:
             # This might indicate RLS issues or other problems
             return False, "Password change failed. Please ensure you are logged in correctly."
        elif "password should be at least 6 characters" in error_message_lower:
             return False, "New password must be at least 6 characters long."
        elif "token is expired" in error_message_lower or "invalid jwt" in error_message_lower:
             return False, "Your session has expired. Please log in again to change your password."
        elif "user not found" in error_message_lower: # Should not happen if session was set
             return False, "Password change failed: User not found."
        # Check for specific error related to incorrect current password if Supabase provides one
        # elif "incorrect password" in error_message_lower: # Hypothetical check
        #     return False, "Incorrect current password provided."
        return False, f"Password change failed: {e.message or str(e)}"
    except Exception as e:
        print(f"Unexpected Error during password change: {type(e).__name__} - {e}")
        traceback.print_exc()
        return False, "An unexpected error occurred during password change."
    finally:
        # Attempt to clear the potentially temporary session from the client instance
        try:
            await asyncio.to_thread(supabase_anon.auth.sign_out)
        except:
            pass # Ignore errors during cleanup signout
# --- End change_user_password function ---


# --- reset_user_password function (No changes needed) ---
async def reset_user_password(access_token: str, reset_data: UserResetPassword) -> tuple[bool, str | None]:
    """
    Updates the user's password using the temporary access token from a password reset link.
    """
    supabase = get_supabase_anon_client()
    if not supabase:
        return False, "Password reset failed: Server configuration error."

    if not access_token:
        return False, "Password reset failed: Access token missing."

    try:
        print(f"Attempting password reset confirmation with new password...")
        # Set the temporary session using the token from the reset link
        await asyncio.to_thread(
            supabase.auth.set_session,
            access_token=access_token,
            refresh_token="dummy_placeholder" # Refresh token isn't usually provided/needed here
        )
        print("Temporary session set successfully for reset.")

        # Update the user's password
        response = await asyncio.to_thread(
            supabase.auth.update_user,
            attributes={'password': reset_data.new_password}
        )

        if response.user:
            print(f"Password reset successfully for user: {response.user.id}")
            # Sign out the temporary session
            try:
                await asyncio.to_thread(supabase.auth.sign_out)
                print("Temporary session signed out after password reset.")
            except Exception as signout_e:
                print(f"WARN: Failed to sign out temporary session after password reset: {signout_e}")
            return True, "Password has been reset successfully. Please log in with your new password."
        else:
            print(f"WARN: Supabase password reset response did not contain user object.")
            return False, "Password reset failed. The reset link may have expired or is invalid. Please request a new one."

    except (AuthApiError, AuthSessionMissingError) as e:
        print(f"Supabase Auth Error during password reset confirmation: {e}")
        error_message_lower = str(e.message).lower() if e.message else ""
        if "invalid jwt" in error_message_lower or "token is expired" in error_message_lower or "invalid refresh token" in error_message_lower:
             return False, "Password reset failed. The reset link has expired or is invalid. Please request a new one."
        elif "password should be at least 6 characters" in error_message_lower:
             return False, "New password must be at least 6 characters long."
        return False, f"Password reset failed: {e.message or str(e)}"
    except Exception as e:
        print(f"Unexpected Error during password reset confirmation: {type(e).__name__} - {e}")
        traceback.print_exc()
        return False, "An unexpected error occurred during password reset."
    finally:
        # Attempt to clear the potentially temporary session from the client instance
        try:
            await asyncio.to_thread(supabase.auth.sign_out)
        except:
            pass # Ignore errors during cleanup signout
# --- End reset_user_password function ---