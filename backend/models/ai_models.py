# backend/models/ai_models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatMessage(BaseModel):
    """Represents a single message in the chat history."""
    sender: str = Field(..., description="The sender of the message ('user' or 'assistant')")
    text: str = Field(..., description="The text content of the message")
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class AiChatRequest(BaseModel):
    """Model for the AI chat endpoint request body."""
    session_id: str = Field(..., description="The unique ID for the chat session.")
    message: str = Field(..., description="The user's message to the AI.")

class ChatHistoryResponse(BaseModel):
    """Model for the chat history endpoint response body."""
    session_id: str = Field(..., description="The unique ID for the chat session.")
    messages: List[Dict[str, Any]] = Field(default_factory=list, description="The chat history for the session.")

class ConversationTimeQuery(BaseModel):
    """Input model for the conversation history retrieval tool BY TIME."""
    target_date: str = Field(..., description="The target date in YYYY-MM-DD format. Example: 2025-04-24")
    target_time: str = Field(..., description="The target time in HH:MM format (24-hour clock). Example: 14:30 for 2:30 PM")
    time_range_minutes: Optional[int] = Field(None, description="Optional: The +/- range in minutes around the target time to search within (e.g., 15). Defaults to 15 if not provided.")

# --- CORRECTED MODEL ---
class ConversationContentQuery(BaseModel):
    """Input model for the conversation history retrieval tool BY CONTENT."""
    search_query: str = Field(..., description="The text phrase or keywords to search for within the conversation history.")
    # Make optional and remove default from Field definition
    max_results: Optional[int] = Field(None, description="Optional: Maximum number of matching messages to return. Defaults to 5 if not provided.")