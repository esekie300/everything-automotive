# backend/services/user_service.py

from supabase import Client, create_client
from postgrest.exceptions import APIError
# Import BOTH client getters and necessary models/types
from ..database.supabase_client import get_supabase_anon_client, get_supabase_service_client
from ..models.user_models import UserProfileUpdate, UserProfile
from uuid import UUID # Import UUID for type hinting
import asyncio # <<< ADD asyncio import

async def update_user_profile(user_id: UUID | str, profile_data: UserProfileUpdate) -> tuple[UserProfile | None, str | None]:
    """Updates a user's profile in the public.profiles table."""
    supabase_service = get_supabase_service_client()
    if not supabase_service:
        print("ERROR: Service client not available for profile update.")
        return None, "Profile update failed: Server configuration error."

    user_id_str = str(user_id)
    # Use exclude_unset=True to only include fields explicitly provided in the request
    update_payload = profile_data.model_dump(exclude_unset=True)

    # If no fields were provided in the update request
    if not update_payload:
        try:
            # Fetch the current profile to return it
            # <<< WRAP synchronous call in asyncio.to_thread >>>
            current_profile_response = await asyncio.to_thread(
                supabase_service.table('profiles')
                                .select('*')
                                .eq('id', user_id_str)
                                .limit(1)
                                .execute
            )
            if current_profile_response.data:
                profile_data_dict = current_profile_response.data[0]
                # Ensure necessary fields are strings for Pydantic model
                profile_data_dict['id'] = str(profile_data_dict['id'])
                profile_data_dict['created_at'] = str(profile_data_dict.get('created_at', ''))
                # profile_data_dict['updated_at'] = str(profile_data_dict.get('updated_at', '')) # If needed
                current_profile = UserProfile(**profile_data_dict)
                return current_profile, "No update data provided, returning current profile."
            else:
                # This case should ideally not happen if the user_id is valid
                return None, "No update data provided, and profile not found."
        except Exception as e:
             print(f"Error fetching current profile for {user_id_str} when no update data provided: {e}")
             return None, "No update data provided, error fetching current profile."

    print(f"Attempting to update profile for user {user_id_str} with payload: {update_payload}")

    try:
        # Perform the update
        # <<< WRAP synchronous call in asyncio.to_thread >>>
        response = await asyncio.to_thread(
            supabase_service.table('profiles')
                            .update(update_payload)
                            .eq('id', user_id_str)
                            # Use 'minimal' return to just get confirmation, then fetch fresh data
                            .execute
        )

        print(f"Supabase profile update response for user {user_id_str}: {response}")

        # After a successful update, fetch the complete updated profile
        # <<< WRAP synchronous call in asyncio.to_thread >>>
        updated_profile_response = await asyncio.to_thread(
            supabase_service.table('profiles')
                            .select('*')
                            .eq('id', user_id_str)
                            .limit(1)
                            .execute
        )

        if updated_profile_response.data:
            profile_data_dict = updated_profile_response.data[0]
            # Ensure necessary fields are strings for Pydantic model
            profile_data_dict['id'] = str(profile_data_dict['id'])
            profile_data_dict['created_at'] = str(profile_data_dict.get('created_at', ''))
            # profile_data_dict['updated_at'] = str(profile_data_dict.get('updated_at', '')) # If needed
            updated_profile = UserProfile(**profile_data_dict)
            print(f"Profile for user {user_id_str} updated successfully.")
            return updated_profile, "Profile updated successfully."
        else:
             # This case might happen if RLS prevents reading after update, though service key should bypass
             print(f"WARN: Profile update successful for {user_id_str}, but failed to fetch updated profile.")
             return None, "Profile updated, but failed to retrieve latest data."

    except APIError as e:
        print(f"Supabase DB Error updating profile for {user_id_str}: {e}")
        # Check if the error indicates the profile doesn't exist
        if "0 rows" in str(e.message).lower() or e.code == 'PGRST116': # PGRST116 often means no rows updated/found
             # <<< WRAP synchronous call in asyncio.to_thread >>>
             check_response = await asyncio.to_thread(
                 supabase_service.table('profiles').select('id').eq('id', user_id_str).limit(1).execute
             )
             if not check_response.data:
                 print(f"ERROR: Profile update failed for {user_id_str}: User profile not found.")
                 return None, "Profile update failed: User profile not found."
             else:
                 # Row exists, but update didn't change anything or failed for other reasons
                 error_message = f"Profile update failed: Database error ({e.message or e.code or 'unknown'})."
                 return None, error_message
        else:
            error_message = f"Profile update failed: Database error ({e.message or e.code or 'unknown'})."
            return None, error_message
    except Exception as e:
        print(f"Unexpected Error updating profile for {user_id_str}: {type(e).__name__} - {e}")
        return None, "An unexpected error occurred during profile update."