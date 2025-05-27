# backend/api/ai.py
from flask import Blueprint, request, jsonify, Response, stream_with_context
from ..services.ai_service import run_ai_mechanic_agent, get_chat_history # Service yields SSE strings
from ..services.auth_service import get_user_from_token
from ..models.ai_models import AiChatRequest, ChatHistoryResponse
from pydantic import ValidationError
import asyncio
import json
import traceback

ai_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')

# --- REVERTED: Chat Endpoint (Synchronous Route, Async Generator Consumer) ---
@ai_bp.route('/chat', methods=['POST'])
def chat_with_ai_mechanic_stream(): # Changed back to synchronous 'def'
    """
    Endpoint for users to chat with the AI Mechanic Agent using SSE streaming.
    Requires authentication. Accepts session ID and user message.
    Uses a synchronous route that manages an async generator yielding SSE strings.
    """
    # --- Authentication Check ---
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response("data: {\"error\": \"Authentication required\"}\n\n", status=401, mimetype='text/event-stream')

    access_token = auth_header.split(' ')[1]

    # --- Run async function synchronously to get user profile ---
    try:
        # Use asyncio.run() for the one-off async call in the sync route
        user_profile = asyncio.run(get_user_from_token(access_token))
        if not user_profile:
             return Response("data: {\"error\": \"Invalid or expired token\"}\n\n", status=401, mimetype='text/event-stream')
    except Exception as auth_err:
         print(f"Error during sync auth check: {auth_err}")
         traceback.print_exc()
         return Response("data: {\"error\": \"Authentication check failed\"}\n\n", status=500, mimetype='text/event-stream')
    # --- End Authentication Check ---

    # --- Get JSON data ---
    json_data = request.get_json()
    if not json_data:
        return Response("data: {\"error\": \"Invalid request body. JSON expected.\"}\n\n", status=400, mimetype='text/event-stream')
    print(f"DEBUG: Received JSON data: {json_data}")
    # --- End Get JSON data ---

    # --- Validate Request Body ---
    try:
        chat_data = AiChatRequest(**json_data)
    except ValidationError as e:
        print(f"API Error validating AI chat request: {e.errors()}")
        error_detail = json.dumps({"error": "Invalid input data", "details": e.errors()})
        return Response(f"data: {error_detail}\n\n", status=400, mimetype='text/event-stream')
    # --- End Validation ---

    # --- Define the Synchronous Wrapper for the Async Generator ---
    def sync_generate_wrapper():
        # Create a new event loop for this request's async tasks
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # Get the async generator from the service (it yields SSE strings)
        sse_generator = run_ai_mechanic_agent(
            user_profile=user_profile,
            session_id=chat_data.session_id,
            user_message=chat_data.message,
        )

        try:
            while True:
                # Run the async generator until the next yield (which is an SSE string)
                sse_string = loop.run_until_complete(sse_generator.__anext__())
                yield sse_string # Yield the complete SSE string
        except StopAsyncIteration:
            print("SSE stream generation finished in wrapper.")
            pass # Generator finished normally
        # <<< MODIFICATION START: Catch specific ValueError here >>>
        except ValueError as ve:
            # Check if it's the specific context error from tracing
            if "was created in a different Context" in str(ve):
                # <<< MATCHING SUPPRESSION LOGIC FROM SERVICE >>>
                print(f"INFO: Suppressing known contextvar ValueError in sync_generate_wrapper: {ve}")
                # Don't yield an error, just stop iteration gracefully.
                pass
            else:
                # If it's a different ValueError, handle it and yield SSE error
                print(f"ERROR: Caught unexpected ValueError in sync_generate_wrapper: {ve}")
                traceback.print_exc()
                error_detail = json.dumps({"error": f"Generator failed: ValueError - {ve}"})
                yield f"event: error\ndata: {error_detail}\n\n"
        # <<< MODIFICATION END >>>
        except Exception as e:
             # Log other errors from the generator if they propagate here
             print(f"Error caught in sync_generate_wrapper: {type(e).__name__} - {e}")
             traceback.print_exc()
             error_detail = json.dumps({"error": f"Generator failed: {type(e).__name__}"})
             yield f"event: error\ndata: {error_detail}\n\n"
        finally:
            loop.close() # Clean up the event loop
    # --- End Synchronous Wrapper ---

    # --- Return the Streaming Response (Wrap the *synchronous* wrapper) ---
    # stream_with_context might still be needed for the sync wrapper
    return Response(stream_with_context(sync_generate_wrapper()), mimetype='text/event-stream')
# --- End Reverted Chat Endpoint ---


# --- AI Chat History Endpoint (Keep as is, fully async) ---
@ai_bp.route('/history/<session_id>', methods=['GET'])
async def get_ai_chat_history(session_id):
    """
    Endpoint to fetch chat history for a specific session.
    Requires authentication.
    """
    # --- Authentication Check ---
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Authentication required"}), 401

    access_token = auth_header.split(' ')[1]
    user_profile = await get_user_from_token(access_token)
    if not user_profile:
        return jsonify({"message": "Invalid or expired token, or user profile not found. Please log in again."}), 401
    # --- End Authentication Check ---

    # --- Fetch Session Chat History ---
    try:
        history_messages = await get_chat_history(user_profile.id, session_id)
        response_data = ChatHistoryResponse(
            session_id=session_id,
            messages=[msg.model_dump() for msg in history_messages]
        )
        return jsonify(response_data.model_dump()), 200

    except Exception as e:
        print(f"API Error fetching AI chat history for session {session_id}: {e}")
        return jsonify({"message": "An error occurred while fetching chat history."}), 500