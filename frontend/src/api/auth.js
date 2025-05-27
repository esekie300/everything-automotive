// frontend/src/api/auth.js
import { apiClient } from './index';

/**
 * Authentication API endpoints
 */
const authApi = {
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  logout: async () => {
    // apiClient automatically adds Auth header if token exists,
    // but backend logout doesn't strictly require it if clearing local state.
    return await apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    // Requires Authorization header, added by apiClient
    return await apiClient.get('/auth/user');
  },

  updateUserProfile: async (profileData) => {
    // Requires Authorization header, added by apiClient
    return await apiClient.put('/auth/user', profileData);
  },

  changePassword: async (passwordData) => {
    // Requires Authorization header, added by apiClient
    return await apiClient.put('/auth/password', passwordData);
  },

  forgotPassword: async (emailData) => {
    // emailData should be an object like { email: "user@example.com" }
    // No Authorization header needed for this public endpoint
    return await apiClient.post('/auth/forgot-password', emailData);
  },

  // --- Function for Reset Password Confirmation ---
  resetPassword: async (resetData) => {
    // resetData should be { new_password: "...", confirm_new_password: "..." }
    // This relies on the Supabase client having implicitly set the session
    // from the URL fragment's access_token before this call is made.
    // The apiClient will automatically include the Authorization header if the
    // implicit session was successfully established by Supabase client.
    return await apiClient.post('/auth/reset-password', resetData);
  },
  // --- End of Function ---
};

// <<< EXPORT authApi AS A NAMED EXPORT >>>
export { authApi };
// <<< REMOVE OR COMMENT OUT THE DEFAULT EXPORT >>>
// export default authApi; // Remove this line