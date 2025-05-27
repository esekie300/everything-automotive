// frontend/src/api/index.js
/**
 * Base API configuration for making requests to the backend
 */
import { supabase } from '../utils/supabaseClient'; // Ensure supabase client is imported

// --- DEFINE CONSTANTS AND HELPERS AT THE TOP ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Default headers
const headers = {
  'Content-Type': 'application/json',
};

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  // console.log('[getAuthHeader] Token from storage:', token); // Debug log
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// --- END DEFINITIONS ---


/**
 * Generic API request function with automatic token refresh on 401
 */
const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const url = `${API_BASE_URL}${endpoint}`; // API_BASE_URL is now defined above
  let currentOptions = { ...options };

  // Merge headers with auth header if available
  currentOptions.headers = {
    ...headers, // headers is now defined above
    ...currentOptions.headers,
    ...getAuthHeader(), // getAuthHeader is now defined above
  };

  // Ensure body is stringified if it's an object and method is POST/PUT
  if ((currentOptions.method === 'POST' || currentOptions.method === 'PUT') && typeof currentOptions.body === 'object' && currentOptions.body !== null) {
    console.log('[apiRequest] Stringifying body:', currentOptions.body);
    try {
      currentOptions.body = JSON.stringify(currentOptions.body);
    } catch (stringifyError) {
       console.error('[apiRequest] Failed to stringify body:', stringifyError);
       throw new Error('Failed to prepare request data.');
    }
  } else {
     console.log('[apiRequest] Body not stringified (method/type check failed or body null/not object):', typeof currentOptions.body);
  }

  try {
    console.log(`[apiRequest] ${isRetry ? 'Retrying' : 'Sending'} ${currentOptions.method || 'GET'} to ${url} with options:`, JSON.stringify(currentOptions)); // Log stringified options
    const response = await fetch(url, currentOptions);
    console.log(`[apiRequest] Response received for ${url}. Status: ${response.status}`); // Log status immediately

    // --- Handle 401 Unauthorized: Attempt Refresh (only if not already a retry) ---
    if (!response.ok && response.status === 401 && !isRetry) {
      console.log('[apiRequest] Received 401.');

      // --- MODIFIED: Check response body for specific login/confirmation failure messages ---
      let data = null;
      let specificErrorMessage = null; // Store the specific error message if found
      try {
          const clonedResponse = response.clone();
          console.log('[apiRequest] Attempting to parse 401 response body as JSON...');
          data = await clonedResponse.json();
          console.log('[apiRequest] Parsed 401 response body:', data);

          // Check for known error messages that should NOT trigger a refresh
          if (data && typeof data.message === 'string') {
              const messageLower = data.message.toLowerCase();
              if (messageLower.includes('invalid email or password')) {
                  specificErrorMessage = data.message;
                  console.log('[apiRequest] Detected specific login failure message:', specificErrorMessage);
              } else if (messageLower.includes('please confirm your email address')) { // <<< ADDED CHECK
                  specificErrorMessage = data.message;
                  console.log('[apiRequest] Detected email confirmation required message:', specificErrorMessage);
              } else {
                  console.log('[apiRequest] 401 response body did NOT contain a known specific failure message. Body:', data);
              }
          }
      } catch (jsonError) {
          console.warn('[apiRequest] Failed to parse 401 response body as JSON:', jsonError);
          // Body might not be JSON, proceed to refresh attempt if no specific error found yet
      }

      // If a specific error message (login fail OR email confirm needed) was found, throw it immediately, skip refresh
      if (specificErrorMessage) {
          console.log('[apiRequest] Failing immediately due to specific error:', specificErrorMessage);
          const error = new Error(specificErrorMessage);
          error.status = 401;
          error.data = data; // Attach parsed data if available
          throw error; // Throw the specific error
      }
      // --- END MODIFICATION ---


      // --- Proceed with token refresh ONLY if NO specific error message was found ---
      console.log('[apiRequest] No specific login/confirmation error detected in 401 body. Proceeding to token refresh attempt...'); // Modified log
      try {
        // Use Supabase client to refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error('[apiRequest] Token refresh failed:', refreshError.message);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          // <<< THROW THE REFRESH ERROR MESSAGE >>>
          // Use the original refresh error message if available, otherwise a generic one
          const error = new Error(refreshError.message || 'Session expired and refresh failed.');
          error.status = 401;
          throw error;
        }

        if (refreshData && refreshData.session) {
          console.log('[apiRequest] Token refresh successful. Updating storage.');
          localStorage.setItem('accessToken', refreshData.session.access_token);
          localStorage.setItem('refreshToken', refreshData.session.refresh_token);
          // Retry the original request
          console.log('[apiRequest] Retrying original request with new token...');
          return await apiRequest(endpoint, options, true); // Pass original options

        } else {
           console.error('[apiRequest] Refresh session returned no error but no session data.');
           const error = new Error('Token refresh attempt failed unexpectedly.');
           error.status = 401;
           throw error;
        }

      } catch (refreshCatchError) {
         console.error('[apiRequest] Error during refresh/retry logic:', refreshCatchError);
         localStorage.removeItem('accessToken');
         localStorage.removeItem('refreshToken');
         localStorage.removeItem('user');
         // <<< RETHROW THE CAUGHT REFRESH ERROR >>>
         const error = new Error(refreshCatchError.message || 'Session refresh failed.');
         error.status = refreshCatchError.status || 401;
         throw error;
      }
    }
    // --- End 401 Handling ---

    // --- Process Response ---
    let responseData = null;
    try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1 && response.status !== 204) {
             responseData = await response.json();
             // <<< ADDED LOGGING for non-OK JSON response >>>
             if (!response.ok) {
                 console.log(`[apiRequest] Parsed non-OK JSON response for ${url} (Status: ${response.status}):`, responseData);
             } else {
                 console.log(`[apiRequest] Parsed OK JSON response for ${url}:`, responseData);
             }
        } else if (response.status === 204) {
             console.log(`[apiRequest] Received 204 No Content for ${url}.`);
        } else if (!response.ok) {
             console.warn(`[apiRequest] Response for ${url} was not JSON or empty. Status: ${response.status}. Content-Type: ${contentType}`);
        } else {
             console.log(`[apiRequest] Response for ${url} was not JSON but status OK (${response.status}). Content-Type: ${contentType}`);
        }
    } catch (jsonError) {
        console.error(`[apiRequest] Response JSON parsing failed for ${url}. Status: ${response.status}`, jsonError);
        // If the original response was NOT ok, we still want to throw an error below
        if (!response.ok) {
            const error = new Error(`API request failed with status ${response.status} and couldn't parse error body.`);
            error.status = response.status;
            throw error;
        }
        // If response was OK but JSON parsing failed (unexpected), maybe return null or rethrow?
        // Let's rethrow for now to make it obvious.
        throw new Error(`API request succeeded (${response.status}) but failed to parse JSON response.`);
    }

    if (!response.ok) {
      // Use the already parsed responseData if available, otherwise construct message
      const errorMessage = responseData?.message || `API request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData; // Attach parsed data if available
      console.error(`[apiRequest] Throwing error for failed request to ${url}. Status: ${response.status}. Message: ${errorMessage}`); // Log before throwing
      throw error;
    }

    console.log(`[apiRequest] Successful request to ${url}. Status: ${response.status}.`);
    return responseData; // Return the parsed data

  } catch (error) {
    // Log the error regardless of where it was thrown from (fetch, refresh, parsing, etc.)
    console.error('[apiRequest] Final catch block:', error.message, 'Status:', error.status);
    // Rethrow the error so calling functions (like in services/auth.js) can catch it
    throw error;
  }
};

// --- DEFINE apiClient AFTER HELPERS AND apiRequest ---
export const apiClient = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data // Pass data directly, apiRequest handles stringification
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data // Pass data directly, apiRequest handles stringification
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
// --- END apiClient DEFINITION ---