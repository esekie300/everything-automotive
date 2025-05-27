// frontend/src/services/ai.js
import { aiApi } from '../api/ai'; 
// Removed direct import of apiClient as we need custom fetch logic for SSE

/**
 * AI service to handle chat interactions and history
 */
const aiService = {
  /**
   * Sends a message to the AI Mechanic Agent and streams the response via SSE.
   * @param {string} sessionId - The unique ID for the chat session.
   * @param {string} message - The user's message.
   * @param {function(string): void} onChunkReceived - Callback function invoked with each text chunk received.
   * @param {function(): void} onStreamEnd - Callback function invoked when the stream ends successfully.
   * @param {function(string): void} onError - Callback function invoked if an error occurs during streaming.
   * @returns {Promise<{success: boolean, error?: string}>} - Indicates if the stream connection was established. Errors during streaming are handled via the onError callback.
   */
  sendChatMessageStream: async (sessionId, message, onChunkReceived, onStreamEnd, onError) => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
    const url = `${API_BASE_URL}/ai/chat`;
    const token = localStorage.getItem('accessToken');

    if (!token) {
        const errorMsg = "Authentication token not found.";
        console.error("sendChatMessageStream:", errorMsg);
        onError(errorMsg); // Notify via callback
        return { success: false, error: errorMsg };
    }

    try {
      console.log("aiService: Attempting to connect to SSE stream...");
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream' // Important: Tell the server we expect SSE
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
          // History is no longer sent from frontend, backend fetches it
        })
      });

      if (!response.ok) {
        // Try to get error message from backend if possible
        let errorData = { message: `HTTP error! status: ${response.status}` };
        try {
            errorData = await response.json();
        } catch (e) { /* Ignore if response is not JSON */ }
        const errorMsg = errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser or no response body.');
      }

      console.log("aiService: SSE stream connection established.");

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = ''; // Buffer to handle partial messages

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("aiService: SSE stream finished.");
          onStreamEnd(); // Signal stream end
          break;
        }

        buffer += decoder.decode(value, { stream: true }); // Decode chunk and append to buffer

        // Process complete messages in the buffer (messages end with \n\n)
        let boundaryIndex;
        while ((boundaryIndex = buffer.indexOf('\n\n')) >= 0) {
            const message = buffer.slice(0, boundaryIndex); // Extract one message
            buffer = buffer.slice(boundaryIndex + 2); // Remove message from buffer

            if (message.startsWith('event: end')) {
                console.log("aiService: Received end event.");
                continue;
            } else if (message.startsWith('event: error')) {
                 console.error("aiService: Received error event.");
                 try {
                     const dataLine = message.split('\n').find(line => line.startsWith('data: '));
                     if (dataLine) {
                         const errorJson = dataLine.substring(6).trim();
                         const errorPayload = JSON.parse(errorJson);
                         onError(errorPayload.error || "Unknown error from server.");
                     } else {
                         onError("Received error event with no data.");
                     }
                 } catch (e) {
                     console.error("Error parsing SSE error event:", e);
                     onError("Failed to parse error event from server.");
                 }
            } else if (message.startsWith('data: ')) {
                const data = message.substring(6).trim();
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.response) {
                        onChunkReceived(parsed.response);
                    } else if (parsed.error) {
                        console.error("aiService: Received error in data payload:", parsed.error);
                        onError(parsed.error);
                    }
                } catch (e) {
                    console.error('Error parsing SSE data JSON:', e, 'Data:', data);
                }
            }
        } // end while(boundaryIndex)
      } // end while(true)

      return { success: true };

    } catch (error) {
      console.error('Error sending/streaming chat message:', error);
      onError(error.message || "Failed to connect or process stream.");
      return { success: false, error: error.message };
    }
  },

  // --- CORRECTED: getChatHistory ---
  getChatHistory: async (sessionId) => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
    const url = `${API_BASE_URL}/ai/history/${sessionId}`;
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return { success: false, error: "Authentication token not found." };
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorData = { message: `HTTP error! status: ${response.status}` };
        try {
            errorData = await response.json();
        } catch(e) { /* ignore */ }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Backend response model now has messages as list of dicts
      if (data?.messages) {
        console.log(`aiService: Fetched ${data.messages.length} raw history messages from backend.`);
        // Map backend dicts to frontend {sender, text} structure
        const loadedMessages = data.messages.map((msg, index) => {
            console.log(`[getChatHistory] Mapping raw message index ${index}:`, JSON.stringify(msg));
            // <<< --- CORRECTED PROPERTY NAME --- >>>
            const messageText = msg.text || '[No Text Found in Backend Data]'; // Use msg.text
            // <<< --- END CORRECTION --- >>>
            const mappedMsg = {
                sender: msg.sender,
                text: messageText
            };
            console.log(`[getChatHistory] Mapped message index ${index}:`, JSON.stringify(mappedMsg));
            return mappedMsg;
        });
        return { success: true, history: loadedMessages };
      } else {
        console.warn("aiService: Received unexpected history response structure.", data);
        return { success: true, history: [] }; // Return empty array on unexpected structure
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { success: false, error: error.message || "Failed to load chat history." };
    }
  },
  // --- END CORRECTION ---
};

export default aiService;