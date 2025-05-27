# backend/api/auth.py
from flask import Blueprint, request, jsonify, make_response
# --- Import specific functions directly from service modules ---
from ..services.auth_service import ( # Group imports for readability
    register_user,
    login_user,
    logout_user,
    get_user_from_token,
    change_user_password,
    request_password_reset,
    reset_user_password # Correct import
)
from ..services.user_service import update_user_profile
# --- Import models ---
from ..models.user_models import ( # Group imports
    UserRegistration,
    UserLogin,
    UserProfileUpdate,
    UserPasswordChange,
    UserForgotPassword,
    UserResetPassword # Correct import
)
from pydantic import ValidationError
import asyncio

# Define the Blueprint
auth_bp = Blueprint('auth_api', __name__, url_prefix='/api/auth')

# --- Registration Endpoint (Cleaned Up) ---
@auth_bp.route('/register', methods=['POST'])
async def register():
    """User registration endpoint."""
    # print("--- Backend /register endpoint hit ---") # Removed debug log
    try:
        user_data = UserRegistration(**request.json)
    except ValidationError as e:
        # print("DEBUG: Validation Error") # Removed debug log
        return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

    profile, message = await register_user(user_data)
    # print(f"DEBUG: register_user returned -> profile: {profile}, message: '{message}'") # Removed debug log

    # Check for specific known error messages first
    if message == "Email already registered.":
        # print("DEBUG: Condition met: message == 'Email already registered.'") # Removed debug log
        return jsonify({"message": message}), 409 # Return 409 Conflict

    elif "failed" in (message or "").lower() or profile is None and message not in [
        "Registration successful. Please check your email to confirm your account.",
        "Registration successful."
    ]:
         # print(f"DEBUG: Condition met: Other failure. Message: '{message}'") # Removed debug log
         status_code = 400 # Default to Bad Request for other failures
         return jsonify({"message": message or "Registration failed."}), status_code

    # Check for success messages
    elif message == "Registration successful. Please check your email to confirm your account.":
        # print("DEBUG: Condition met: message == 'Registration successful. Please check your email...'") # Removed debug log
        return jsonify({"message": message}), 201 # Email confirmation needed

    elif message == "Registration successful.":
         # print("DEBUG: Condition met: message == 'Registration successful.'") # Removed debug log
         return jsonify({"message": message}), 201 # Direct success

    # Fallback
    else:
        # print(f"DEBUG: Fallback condition met. Message: '{message}'") # Removed debug log
        status = 201 if profile else 400
        return jsonify({"message": message or "Registration status unknown."}), status

# --- Login Endpoint (MODIFIED with Logging) ---
@auth_bp.route('/login', methods=['POST'])
async def login():
    """User login endpoint."""
    try:
        login_data = UserLogin(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

    session, message = await login_user(login_data)

    if session:
        response_data = {"message": message, "session": session.model_dump()}
        resp = make_response(jsonify(response_data), 200)
        return resp
    else:
        # <<< ADDED LOGGING >>>
        error_message = message or "Login failed."
        print(f"[/api/auth/login] Login failed. Returning 401 with message: '{error_message}'")
        # Return 401 for login failures
        return jsonify({"message": error_message}), 401
# --- End Login Endpoint ---

# --- Logout Endpoint (Cleaned Up) ---
@auth_bp.route('/logout', methods=['POST'])
async def logout():
    """User logout endpoint."""
    auth_header = request.headers.get('Authorization')
    access_token = None
    if auth_header and auth_header.startswith('Bearer '):
        access_token = auth_header.split(' ')[1]

    success, message = await logout_user(access_token)

    resp = make_response(jsonify({"message": message or "Logout processed. Please clear local tokens."}), 200)
    return resp

# --- Combined User Profile Endpoint (GET and PUT) (Cleaned Up) ---
@auth_bp.route('/user', methods=['GET', 'PUT'])
async def handle_user_profile():
    """Handles getting (GET) or updating (PUT) the current user's profile."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Authorization header missing or invalid"}), 401

    access_token = auth_header.split(' ')[1]

    user = await get_user_from_token(access_token)
    if not user:
        return jsonify({"message": "Invalid or expired token, or profile not found"}), 401

    if request.method == 'GET':
        # print(f"GET /api/auth/user requested for user_id: {user.id}") # Removed debug log
        return jsonify(user.model_dump()), 200

    elif request.method == 'PUT':
        # print(f"PUT /api/auth/user requested for user_id: {user.id}") # Removed debug log
        user_id = user.id

        try:
            update_data = UserProfileUpdate(**request.json)
        except ValidationError as e:
            return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

        updated_profile, message = await update_user_profile(user_id, update_data)

        if updated_profile:
            return jsonify({"message": message, "user": updated_profile.model_dump()}), 200
        else:
            status_code = 404 if "not found" in (message or "").lower() else 400
            return jsonify({"message": message or "Profile update failed."}), status_code

    else:
         return jsonify({"message": "Method not supported for this endpoint"}), 405

# --- Forgot Password Request Endpoint (Cleaned Up) ---
@auth_bp.route('/forgot-password', methods=['POST'])
async def forgot_password():
    """Initiates the password reset process for a user."""
    try:
        forgot_data = UserForgotPassword(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

    success, message = await request_password_reset(forgot_data)
    return jsonify({"message": message or "Password reset request processed."}), 200

# --- Password Reset Confirmation Endpoint (Cleaned Up) ---
@auth_bp.route('/reset-password', methods=['POST'])
async def handle_reset_password():
    """Handles the actual password update after user clicks the reset link."""
    auth_header = request.headers.get('Authorization')
    access_token = None
    if auth_header and auth_header.startswith('Bearer '):
        access_token = auth_header.split(' ')[1]
    else:
        # print("Reset password attempt failed: Authorization header missing or invalid.") # Removed debug log
        return jsonify({"message": "Password reset failed. Invalid request or missing token."}), 401

    try:
        reset_data = UserResetPassword(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

    success, message = await reset_user_password(access_token, reset_data)

    if success:
        return jsonify({"message": message or "Password reset successfully."}), 200
    else:
        status_code = 400
        if "token" in (message or "").lower() or "invalid" in (message or "").lower():
             status_code = 401
        return jsonify({"message": message or "Password reset failed."}), status_code

# --- Password Change Endpoint (Authenticated User) (Cleaned Up) ---
@auth_bp.route('/password', methods=['PUT'])
async def change_password():
    """Changes the password for the currently authenticated user."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Authorization header missing or invalid"}), 401

    access_token = auth_header.split(' ')[1]

    try:
        password_data = UserPasswordChange(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Invalid input data", "errors": e.errors()}), 400

    success, message = await change_user_password(access_token, password_data)

    if success:
        return jsonify({"message": message or "Password updated successfully."}), 200
    else:
        status_code = 401 if "session expired" in (message or "").lower() or "logged in correctly" in (message or "").lower() else 400
        return jsonify({"message": message or "Password change failed."}), status_code