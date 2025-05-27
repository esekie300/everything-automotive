# backend/models/__init__.py

# Import models from individual files to make them accessible
from .user_models import (
    UserRegistration,
    UserLogin,
    UserProfile,
    UserSession,
    UserProfileUpdate,
    UserPasswordChange,
    UserForgotPassword,
    UserResetPassword
)

from .ai_models import ( # <<< ADD THIS LINE
    ChatMessage,         # <<< ADD THIS LINE
    AiChatRequest,       # <<< ADD THIS LINE
    ChatHistoryResponse  # <<< ADD THIS LINE
)

# Optional: Define __all__ if you want to control what is imported by '*'
# __all__ = [
#     "UserRegistration",
#     "UserLogin",
#     "UserProfile",
#     "UserSession",
#     "UserProfileUpdate",
#     "UserPasswordChange",
#     "UserForgotPassword",
#     "UserResetPassword",
#     "ChatMessage",
#     "AiChatRequest",
#     "ChatHistoryResponse",
# ]