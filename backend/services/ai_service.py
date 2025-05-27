# backend/services/ai_service.py
import asyncio
import uuid
import json
from datetime import datetime, timedelta, timezone
import traceback

# --- Corrected Imports for Streaming ---
from agents import Agent, Runner, RunContextWrapper, function_tool
from agents.result import RunResultStreaming
from openai.types.responses import ResponseTextDeltaEvent
from typing import Optional, List, AsyncIterator
# --- End Imports ---

# <<< ADDED: Import config object >>>
from ..config import config
# <<< END ADDED >>>

from ..models.user_models import UserProfile
from ..models.ai_models import ChatMessage, ConversationTimeQuery, ConversationContentQuery
from ..database.supabase_client import get_supabase_anon_client, get_supabase_service_client

# --- Keep AiMechanicContext class ---
class AiMechanicContext:
    user_profile: Optional[UserProfile]
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile

# --- Keep get_conversation_by_time_tool function ---
@function_tool
async def get_conversation_by_time_tool(
    ctx: RunContextWrapper[AiMechanicContext],
    query: ConversationTimeQuery
) -> str:
    if not ctx.context.user_profile:
        return "Error: User profile not found in context."
    user_id = str(ctx.context.user_profile.id)
    print(f"Tool 'get_conversation_by_time_tool' called for user {user_id} with query: {query}")
    supabase_service = get_supabase_service_client()
    if not supabase_service: return "Error: Database service is unavailable."
    try:
        target_dt_str = f"{query.target_date} {query.target_time}"
        target_dt = datetime.strptime(target_dt_str, "%Y-%m-%d %H:%M")
        search_range_minutes = query.time_range_minutes if query.time_range_minutes is not None else 15
        time_delta = timedelta(minutes=search_range_minutes)
        start_dt = target_dt - time_delta
        end_dt = target_dt + time_delta
        start_time_iso = start_dt.isoformat() + "+00:00"
        end_time_iso = end_dt.isoformat() + "+00:00"

        print(f"Querying DB for user {user_id} between {start_time_iso} and {end_time_iso}")
        response = await asyncio.to_thread(
            supabase_service.table('ai_chat_logs')
            .select('sender, message_text, timestamp')
            .eq('user_id', user_id)
            .gte('timestamp', start_time_iso)
            .lte('timestamp', end_time_iso)
            .order('timestamp', desc=False)
            .limit(10).execute
        )
        if response.data:
            results = [{"timestamp": msg['timestamp'], "sender": msg['sender'], "message": msg['message_text']} for msg in response.data]
            print(f"Found {len(results)} messages.")
            return json.dumps(results)
        else:
            print("No messages found in the specified time range.")
            return f"No conversation history found for user {user_id} around {query.target_date} {query.target_time} +/- {search_range_minutes} minutes."
    except ValueError:
         print(f"Error parsing date/time: {query.target_date} {query.target_time}")
         return "Error: Invalid date or time format provided. Please use YYYY-MM-DD and HH:MM."
    except Exception as e:
        print(f"Error querying chat history by time: {type(e).__name__} - {e}")
        return f"An error occurred while retrieving conversation history: {str(e)}"

# --- Keep search_conversation_history_tool function ---
@function_tool
async def search_conversation_history_tool(
    ctx: RunContextWrapper[AiMechanicContext],
    query: ConversationContentQuery
) -> str:
    if not ctx.context.user_profile:
        return "Error: User profile not found in context."
    user_id = str(ctx.context.user_profile.id)
    search_term = query.search_query
    limit = query.max_results if query.max_results is not None else 5
    print(f"Tool 'search_conversation_history_tool' called for user {user_id} with search: '{search_term}', limit: {limit}")
    supabase_service = get_supabase_service_client()
    if not supabase_service: return "Error: Database service is unavailable."
    try:
        response = await asyncio.to_thread(
            supabase_service.table('ai_chat_logs')
            .select('sender, message_text, timestamp')
            .eq('user_id', user_id)
            .ilike('message_text', f'%{search_term}%')
            .order('timestamp', desc=True)
            .limit(limit).execute
        )
        if response.data:
            results = [{"timestamp": msg['timestamp'], "sender": msg['sender'], "message": msg['message_text']} for msg in reversed(response.data)]
            print(f"Found {len(results)} messages matching '{search_term}'.")
            return json.dumps(results)
        else:
            print(f"No messages found matching '{search_term}'.")
            return f"No messages found containing '{search_term}'."
    except Exception as e:
        print(f"Error searching chat history by content: {type(e).__name__} - {e}")
        return f"An error occurred while searching conversation history: {str(e)}"

# --- Keep get_about_page_content_tool function ---
@function_tool
async def get_about_page_content_tool(
    ctx: RunContextWrapper[AiMechanicContext]
) -> str:
    """
    Retrieves a summary of the content found on the Everything Automotive 'About Us' page.
    Use this tool when the user asks about the company, its mission, vision, services overview, or leadership.
    """
    print("Tool 'get_about_page_content_tool' called.")
    # Construct the content string using config and hardcoded summaries
    content = f"""
**About {config.COMPANY_NAME}**

**Introduction & Mission:**
{config.COMPANY_NAME} is your trusted, technology-driven partner for all automotive needs in Nigeria. We're revolutionizing how you buy parts, sell vehicles, and access expert car care.
Our mission is: "{config.COMPANY_MISSION}"
We combine expertise from QSystems Automations Nigeria and Global Automotive Concept Nigeria, led by Mr. Gabriel Osereime Esekie and Engr. Thomas Osebha Esekie.

**Our Comprehensive Services Overview:**
- **Vast Parts E-commerce:** Browse and purchase genuine and high-quality aftermarket parts.
- **Vehicle Marketplace:** Securely buy and sell new, Nigerian-used, and foreign-used vehicles.
- **Workshop & Home Service:** Book appointments at certified workshops or request mobile service.
- **AI Mechanic Assistant:** Get instant diagnostic guidance, part recommendations, and service booking help.

**Why Choose Us?**
- **Nigeria-Focused:** Built specifically for the Nigerian market.
- **Innovative Technology:** Leveraging AI and a modern platform.
- **Expertise & Trust:** Backed by experienced automotive and technology professionals.

**Our Vision:**
To be the undisputed leader in Nigeria's online automotive space, providing unparalleled convenience, value, and trust for every vehicle owner and enthusiast.

**Leadership:**
- Mr. Gabriel Osereime Esekie (QSystems Automations Nigeria): Driving technological innovation.
- Engr. Thomas Osebha Esekie (Global Automotive Concept Nigeria): Providing deep automotive expertise.
"""
    return content.strip()

# --- Keep get_contact_page_content_tool function ---
@function_tool
async def get_contact_page_content_tool(
    ctx: RunContextWrapper[AiMechanicContext]
) -> str:
    """
    Retrieves the contact information and operating hours for Everything Automotive.
    Use this tool when the user asks for phone numbers, email addresses, physical locations, or business hours.
    """
    print("Tool 'get_contact_page_content_tool' called.")
    # Construct the content string using config and hardcoded summaries
    content = f"""
**Contact {config.COMPANY_NAME}**

**General Inquiries:**
- Phone: {config.MAIN_PHONE}
- Email: {config.MAIN_EMAIL}

**Customer Support:**
- Phone: {config.SUPPORT_PHONE}
- Email: {config.SUPPORT_EMAIL}

**Operating Hours:**
- Monday - Friday: 8:00 AM - 6:00 PM
- Saturday: 9:00 AM - 4:00 PM
- Sunday: Closed

**Our Locations:**
- Lagos Head Office: {config.LAGOS_HEAD_OFFICE_ADDRESS}
- Edo State Branch: {config.EDO_BRANCH_ADDRESS}
"""
    return content.strip()

# --- Keep get_services_page_content_tool function ---
@function_tool
async def get_services_page_content_tool(
    ctx: RunContextWrapper[AiMechanicContext]
) -> str:
    """
    Retrieves a summary of the main services offered by Everything Automotive, as listed on the Services page.
    Use this tool when the user asks about the range of services provided.
    """
    print("Tool 'get_services_page_content_tool' called.")
    # Construct the content string using hardcoded summaries based on Services.js
    content = f"""
**{config.COMPANY_NAME} Services Overview:**

We offer a comprehensive suite of services designed to meet all your vehicle needs:

- **Workshop Service & Repairs:** Book appointments at certified partner workshops for routine maintenance, complex repairs, diagnostics, and more.
- **Convenient Home Service:** (Coming Soon!) Qualified technicians can perform maintenance and minor repairs at your home or office.
- **AI Mechanic Assistant:** Get instant diagnostic help, part recommendations, and answers to automotive questions via our AI chat.
- **Extensive Parts Store:** Find and purchase a wide variety of genuine and aftermarket vehicle parts and accessories from trusted sellers.
- **Vehicle Marketplace:** Buy or sell new, Nigerian-used, or foreign-used cars securely on our platform.
- **Fleet Management Solutions:** (Coming Soon!) Tailored services for businesses to manage vehicle fleets efficiently.
- **Bulk Part Purchasing:** (Coming Soon!) Specialized support for businesses needing to purchase parts in large quantities.
- **General Repairs:** Handling engine, transmission, brakes, suspension, and more at partner workshops.
- **Advanced Diagnostics:** Utilizing modern tools to accurately troubleshoot complex vehicle problems.
- **Routine Maintenance:** Services like oil changes, tire rotations, fluid checks, etc.
"""
    return content.strip()


# --- MODIFIED: ai_mechanic_agent definition (Instructions) ---
ai_mechanic_agent = Agent[AiMechanicContext](
    name="AI Mechanic Agent",
    instructions=(
        "You are the AI Mechanic Agent for Everything Automotive. "
        "Your primary goal is to provide helpful, general automotive advice "
        "and information about our company and services. "
        "Refer to the entire conversation history with the user to maintain context. "
        "Use clear formatting, including line breaks for paragraphs and numbered or bulleted lists where appropriate. Use markdown for bolding key terms."
        "Access user information from the provided context if available. "
        "Keep responses concise and friendly.\n\n"

        # <<< START: NEW Section - Handling Incomplete Features >>>
        "**Handling Incomplete Features:**\n"
        "Several features are currently under development and not yet fully available for online interaction through the website or this chat. These include:\n"
        "- **Online Parts Purchasing:** Users cannot currently complete the purchase of parts directly online.\n"
        "- **Online Vehicle Purchasing/Selling:** The platform does not yet support completing vehicle buy/sell transactions online.\n"
        "- **Online Service Booking:** Users cannot currently book specific workshop or home service appointments directly online.\n\n"
        "**If a user asks HOW to perform these specific actions online (e.g., 'How do I buy this part?', 'How can I list my car for sale?', 'Book an oil change for me'), you MUST inform them clearly that the feature is 'coming soon' or 'under development'.**\n"
        "Do NOT provide instructions as if the feature is live. Instead, respond with something like:\n"
        "'The online [feature name, e.g., parts marketplace/vehicle selling platform/service booking system] is currently under development and will be launching soon! Please check back later for updates.'\n"
        "You can also add: 'To be notified when this feature becomes available, please ensure your contact information (email and phone number) is complete in your user profile.'\n"
        "**Important:** This applies only when asked *how* to use these specific online transaction/booking features. If asked *generally* about services or parts (e.g., 'What services do you offer?', 'What should I look for when buying brake pads?'), answer normally using your knowledge or the appropriate tools.\n\n"
        # <<< END: NEW Section - Handling Incomplete Features >>>

        "**Mandatory Disclaimer and Recommendation:**\n"
        "After providing any automotive advice (like diagnostic help, repair steps, maintenance suggestions), you MUST ALWAYS conclude your response with the following text block. Ensure your output includes proper paragraph breaks and markdown bolding as shown:\n\n"
        "Remember, this advice is general information and not a substitute for a professional mechanic's inspection. If you're unsure about any issue, please consult a qualified mechanic promptly to avoid potential problems.\n\n"
        "However, if you'd like a personal consultation, we can recommend Engr. Tom. He is a highly-regarded, certified automobile engineer known for his patience and passion, and he's happy to discuss issues thoroughly.\n\n"
        "**To ensure Engr. Tom can contact you, please first check your account profile and make sure your phone number is complete and correct.**\n\n"
        "Once you've confirmed your phone number is in your profile, if you're interested in speaking with him, please reply with **'Yes, connect me with Engr. Tom'**. We will then arrange the connection.\n\n"
        "**Crucially, only add this block after giving automotive advice.** Do NOT add it when only providing company information (using About, Contact, Services tools) or when refusing off-topic questions.\n\n"

        "**VERY IMPORTANT: Topic Boundaries**\n"
        "You MUST strictly stick to topics related to automobiles (cars, trucks, motorcycles), vehicle parts, vehicle maintenance, vehicle repair, and information about Everything Automotive (its services, contact details, about information).\n"
        "Politely REFUSE to answer any questions outside this scope. Do NOT answer questions about general knowledge, science (like chemistry), cooking (like frying eggs), politics, history, or any other non-automotive topic.\n"
        "If asked an off-topic question, respond with something like: 'My purpose is to assist with automotive questions related to Everything Automotive. I cannot help with topics like [mention the off-topic subject, e.g., chemistry]. How can I help you with your vehicle today?' or 'I specialize in automotive topics for Everything Automotive. I'm unable to answer questions about [mention the off-topic subject]. Do you have any car-related questions?'\n"
        "Do not get drawn into unrelated conversations. Always steer the conversation back to automotive topics or company information.\n\n"

        "**TOOLS:**\n"
        "1. `get_conversation_by_time_tool`: Use this ONLY when the user explicitly asks what was discussed around a specific past **date and time**.\n"
        "2. `search_conversation_history_tool`: Use this when the user asks **what** was said about a topic, or **when** a specific phrase or keyword was mentioned.\n"
        "3. `get_about_page_content_tool`: Use this when the user asks about the company itself, its mission, vision, leadership, or a general overview.\n"
        "4. `get_contact_page_content_tool`: Use this when the user asks for contact details like phone numbers, email addresses, physical locations, or operating hours.\n"
        "5. `get_services_page_content_tool`: Use this when the user asks about the range of services offered by Everything Automotive.\n"
        "\n**IMPORTANT:** When providing information from the About, Contact, or Services tools, clearly state which page the information comes from. Do not invent information not provided by the tools."
    ),
    model="gpt-4o-mini",
    tools=[
        get_conversation_by_time_tool,
        search_conversation_history_tool,
        get_about_page_content_tool,
        get_contact_page_content_tool,
        get_services_page_content_tool,
    ],
)
# --- END MODIFIED: ai_mechanic_agent definition ---


# --- Keep get_full_user_chat_history function ---
async def get_full_user_chat_history(user_id: str) -> List[ChatMessage]:
    supabase_service = get_supabase_service_client()
    if not supabase_service: return []
    print(f"Fetching FULL chat history for user: {user_id}")
    try:
        response = await asyncio.to_thread(
            supabase_service.table('ai_chat_logs')
            .select('sender, message_text, timestamp, context, metadata')
            .eq('user_id', user_id)
            .order('timestamp').execute
        )
        if response.data:
            history = []
            for msg in response.data:
                message_text = msg.get('message_text', '')
                if message_text is None: message_text = ''
                if not message_text.strip(): continue
                history.append(ChatMessage(
                    sender=msg.get('sender', 'unknown'), text=message_text,
                    context=msg.get('context'), metadata=msg.get('metadata')
                ))
            print(f"Fetched and processed {len(history)} total messages for user {user_id}.")
            return history
        else:
            print(f"No chat history found for user {user_id}.")
            return []
    except Exception as e:
        print(f"Error fetching/processing full user chat history from DB: {type(e).__name__} - {e}")
        return []

# --- Keep run_ai_mechanic_agent function (Yields SSE Formatted Strings) ---
async def run_ai_mechanic_agent(
    user_profile: UserProfile,
    session_id: str,
    user_message: str,
) -> AsyncIterator[str]: # Yields SSE formatted strings
    user_id = user_profile.id
    print(f"Running AI Mechanic Agent (Streaming, Global Tracing Disabled) for user: {user_id}, session: {session_id}")
    print(f"Input: {user_message}")

    supabase_service = get_supabase_service_client()
    if not supabase_service:
        # Yield SSE error message
        error_detail = json.dumps({"error": "Database service unavailable."})
        yield f"event: error\ndata: {error_detail}\n\n"
        return

    # --- Save User Message ---
    current_utc_time = datetime.now(timezone.utc)
    lagos_time_now = current_utc_time + timedelta(hours=1)
    timestamp_to_save = lagos_time_now.isoformat()
    user_message_db = ChatMessage(sender="user", text=user_message)
    try:
        await asyncio.to_thread(
            supabase_service.table('ai_chat_logs').insert({
                'user_id': user_id, 'session_id': session_id, 'sender': user_message_db.sender,
                'message_text': user_message_db.text, 'context': user_message_db.context,
                'metadata': user_message_db.metadata,
                'timestamp': timestamp_to_save
            }).execute
        )
        print(f"✅ User message saved to DB: session {session_id}, user {user_id} at {timestamp_to_save}")
    except Exception as e:
        print(f"❌ ERROR saving user message to DB: {type(e).__name__} - {e}")
        traceback.print_exc()

    # --- Fetch Full History for Agent Context ---
    full_user_history = await get_full_user_chat_history(user_id)
    print(f"Using {len(full_user_history)} messages from user's history for context.")
    agent_history = [{"role": 'assistant' if msg.sender == 'assistant' else 'user', "content": msg.text} for msg in full_user_history]
    agent_history.append({"role": "user", "content": user_message})

    # --- Run the AI Agent with Streaming ---
    context_instance = AiMechanicContext(user_profile=user_profile)
    full_response_text = ""
    result_stream: Optional[RunResultStreaming] = None
    stream_error: Optional[Exception] = None

    try:
        print("DEBUG: About to call Runner.run_streamed (NO AWAIT)")
        result_stream = Runner.run_streamed(
            ai_mechanic_agent,
            agent_history,
            context=context_instance,
        )
        print(f"DEBUG: Runner.run_streamed returned object of type: {type(result_stream)}")

        print("DEBUG: Starting async for loop over stream_events()")
        async for event in result_stream.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                text_chunk = event.data.delta
                if text_chunk:
                    full_response_text += text_chunk
                    # <<< YIELD SSE Formatted Data >>>
                    sse_message = f"data: {json.dumps({'response': text_chunk})}\n\n"
                    yield sse_message

        print("DEBUG: Finished async for loop")
        # <<< YIELD SSE End Event >>>
        yield "event: end\ndata: {}\n\n"
        print("SSE stream finished successfully in service.")

    except Exception as e:
        stream_error = e
        print(f"❌ Error during AI Agent streaming loop: {type(e).__name__} - {e}")
        print("Traceback:")
        traceback.print_exc()

        # <<< MODIFICATION START: Selectively yield SSE error >>>
        is_context_error = (
            isinstance(e, ValueError) and
            "was created in a different Context" in str(e)
        )

        if not is_context_error:
            error_detail = json.dumps({"error": f"An error occurred during streaming: {type(e).__name__}"})
            print(f"DEBUG: Yielding SSE error to client: {error_detail}")
            yield f"event: error\ndata: {error_detail}\n\n"
        else:
            print("INFO: Suppressing known contextvar ValueError during stream finalization (not yielding SSE error).")
        # <<< MODIFICATION END >>>

    finally:
        # --- Save Full AI Response After Streaming (in finally block) ---
        print("DEBUG: Entering finally block for AI response saving.")
        if full_response_text:
            print(f"DEBUG: Preparing to save AI response. Accumulated text length: {len(full_response_text)}")
            print(f"DEBUG: Accumulated text (first 100 chars): {full_response_text[:100]}")
            ai_response_utc_time = datetime.now(timezone.utc)
            ai_lagos_time_now = ai_response_utc_time + timedelta(hours=1)
            ai_timestamp_to_save = ai_lagos_time_now.isoformat()
            ai_response_db = ChatMessage(sender="assistant", text=full_response_text)
            payload_to_save = {
                'user_id': user_id,
                'session_id': session_id,
                'sender': ai_response_db.sender,
                'message_text': ai_response_db.text,
                'context': ai_response_db.context,
                'metadata': ai_response_db.metadata,
                'timestamp': ai_timestamp_to_save
            }
            print(f"DEBUG: Payload for saving AI response: {payload_to_save}")
            try:
                await asyncio.to_thread(
                    supabase_service.table('ai_chat_logs').insert(payload_to_save).execute
                )
                print(f"✅ AI response saved to DB: session {session_id}, user {user_id} at {ai_timestamp_to_save}")
            except Exception as save_e:
                print(f"❌ ERROR saving AI response to DB: {type(save_e).__name__} - {save_e}")
                print(f"❌ Failed payload: {payload_to_save}")
                traceback.print_exc()
        elif not stream_error:
             print("WARN: AI Agent produced no text output to save.")
        else:
             is_context_error_finally = (
                 isinstance(stream_error, ValueError) and
                 "was created in a different Context" in str(stream_error)
             )
             if not is_context_error_finally:
                 print("INFO: Skipping AI response save because an error occurred during streaming.")
             else:
                 print("INFO: Skipping AI response save as stream ended with suppressed context error.")


# --- Keep get_chat_history function (used by API endpoint) ---
async def get_chat_history(user_id: str, session_id: str) -> List[ChatMessage]:
    supabase_service = get_supabase_service_client()
    if not supabase_service: return []
    print(f"Fetching SESSION chat history for user: {user_id}, session: {session_id}")
    try:
        response = await asyncio.to_thread(
            supabase_service.table('ai_chat_logs')
            .select('sender, message_text, timestamp, context, metadata')
            .eq('user_id', user_id)
            .eq('session_id', session_id)
            .order('timestamp').execute
        )
        if response.data:
            history = []
            for msg in response.data:
                message_text = msg.get('message_text', '')
                if message_text is None: message_text = ''
                if not message_text.strip(): continue
                history.append(ChatMessage(
                    sender=msg.get('sender', 'unknown'), text=message_text,
                    context=msg.get('context'), metadata=msg.get('metadata')
                ))
            print(f"Fetched and processed {len(history)} messages for session {session_id}.")
            return history
        else:
            print(f"No chat history found for user {user_id}, session {session_id}.")
            return []
    except Exception as e:
        print(f"Error fetching/processing session chat history from DB: {type(e).__name__} - {e}")
        return []