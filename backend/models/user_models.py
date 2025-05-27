# backend/models/user_models.py
from pydantic import BaseModel, EmailStr, Field, validator, constr # Added constr
from typing import Optional
import re # Import the regex module

class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str # UUID as string
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    account_type: Optional[str] = 'personal'
    company_name: Optional[str] = None
    created_at: str # Or datetime object
    # Consider adding updated_at if you need it from the DB
    # updated_at: Optional[str] = None

class UserSession(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str
    user: UserProfile # Embed the user profile

class UserProfileUpdate(BaseModel):
    # Fields that the user is allowed to update
    full_name: Optional[str] = Field(None, min_length=1)
    phone: Optional[str] = None # Validation happens below
    address: Optional[str] = Field(None, min_length=5)
    # account_type: Optional[str] = None # Usually not user-updatable directly via this form
    company_name: Optional[str] = Field(None, min_length=2) # Only relevant if account_type is business

    @validator('phone')
    def validate_phone_number(cls, v):
        if v is None or v == "": # Allow empty string or None
            return None # Return None for empty/null input
        # Simple validation: Optional '+' followed by digits, allowing spaces/hyphens
        pattern = r'^\+?\d[\d\s-]{8,15}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid phone number format')
        return v # Return the original valid string

    class Config:
        exclude_unset = True

# --- Class for Password Change (Authenticated User) ---
class UserPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
    confirm_new_password: str = Field(..., min_length=6)

    @validator('confirm_new_password')
    def passwords_match(cls, v, values, **kwargs):
        # Check if 'new_password' exists in values before comparing
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('New password and confirmation password do not match')
        return v

    @validator('new_password')
    def password_complexity(cls, v):
        # Example: Add complexity requirements if desired (e.g., uppercase, number, symbol)
        if len(v) < 6: # Redundant due to Field constraint, but safe check
             raise ValueError('Password must be at least 6 characters long')
        return v
# --- End of Class for Password Change ---

# --- Class for Forgot Password Request ---
class UserForgotPassword(BaseModel):
    email: EmailStr
# --- End of Class ---

# --- Class for Password Reset Confirmation --- <<< THIS CLASS MUST EXIST
class UserResetPassword(BaseModel):
    new_password: str = Field(..., min_length=6)
    confirm_new_password: str = Field(..., min_length=6)

    @validator('confirm_new_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('new_password')
    def password_complexity(cls, v):
        # Add complexity requirements if desired (matching the other password validator)
        if len(v) < 6:
             raise ValueError('Password must be at least 6 characters long')
        return v
# --- End of Class ---