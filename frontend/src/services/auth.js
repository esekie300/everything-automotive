// frontend/src/services/auth.js
// <<< MODIFIED IMPORT PATH >>>
import { authApi } from '../api/auth'; // Import directly from api/auth.js
import User from '../models/user'; // Import User model

/**
 * Authentication service to handle login, logout, session, profile, and password management
 */
const authService = {
  register: async (userData) => {
    try {
      const response = await authApi.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration service error:", error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  },

  // <<< MODIFIED login function with logging and refined fallback >>>
  login: async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      if (response.session && response.session.access_token && response.session.user) {
        localStorage.setItem('accessToken', response.session.access_token);
        localStorage.setItem('refreshToken', response.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.session.user));
        console.log("[authService.login] Tokens and user stored in localStorage.");
        return { success: true, data: User.fromJSON(response.session.user) };
      } else {
         console.error("[authService.login] Invalid server response structure", response);
         throw new Error(response?.message || 'Login failed: Invalid server response');
      }
    } catch (error) {
      // <<< ADDED LOGGING >>>
      console.error('[authService.login] Caught error:', error);
      console.error('[authService.login] Error message:', error.message);
      console.error('[authService.login] Error status:', error.status);
      // <<< END LOGGING >>>
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // <<< REFINED FALLBACK MESSAGE >>>
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  },
  // <<< END MODIFICATION >>>

  logout: async () => {
    try {
      await authApi.logout();
      console.log("Logout API call successful or handled.");
    } catch (error) {
      console.error('Logout API error:', error.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log("Tokens and user cleared from localStorage.");
    }
    return { success: true };
  },

  getCurrentUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    try {
        if (userStr && userStr !== 'undefined') {
            return JSON.parse(userStr);
        }
        return null;
    } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user');
        return null;
    }
  },

  fetchCurrentUserFromServer: async () => {
    if (!authService.isAuthenticated()) {
        console.log("fetchCurrentUserFromServer: No access token found.");
        return { success: false, error: 'No access token found' };
    }
    try {
      console.log("fetchCurrentUserFromServer: Fetching user from API...");
      const user = await authApi.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      console.log("fetchCurrentUserFromServer: User fetched and storage updated.");
      return { success: true, data: user };
    } catch (error) {
      console.error('Fetch current user error:', error.message);
      // Note: A 401 here during fetch might indicate the token from the reset link
      // was valid but short-lived and expired before this check, OR the implicit
      // session handling failed. The resetPassword call itself might still work
      // if the Supabase client holds the session internally.
      // We might not need to auto-logout here in the reset flow context.
      // if (error.status === 401) {
      //    console.log("fetchCurrentUserFromServer: Received 401, logging out.");
      //    await authService.logout();
      // }
      return { success: false, error: error.message || 'Failed to fetch user' };
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    // Also check if the user object exists, as token might linger after logout
    const user = authService.getCurrentUserFromStorage();
    return !!token && !!user;
  },

  updateProfile: async (profileUpdateData) => {
    if (!authService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      console.log("updateProfile service: Sending update data:", profileUpdateData);
      // <<< This is the line causing the error previously >>>
      const response = await authApi.updateUserProfile(profileUpdateData);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log("updateProfile service: Profile updated and localStorage refreshed.");
        return { success: true, data: User.fromJSON(response.user), message: response.message };
      } else {
        console.warn("updateProfile service: Update response did not contain user object.", response);
         return { success: true, data: null, message: response.message || "Profile updated, but couldn't confirm latest data." };
      }
    } catch (error) {
      console.error("Update profile service error:", error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  },

  changePassword: async (passwordChangeData) => {
    if (!authService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      console.log("changePassword service: Sending password change request...");
      const response = await authApi.changePassword(passwordChangeData);
      console.log("changePassword service: Request successful.", response);
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Change password service error:", error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  },

  requestPasswordReset: async (email) => {
    try {
      console.log("requestPasswordReset service: Sending request for email:", email);
      const emailData = { email: email };
      const response = await authApi.forgotPassword(emailData);
      console.log("requestPasswordReset service: Request successful.", response);
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Request password reset service error:", error);
      return { success: false, error: error.message || 'Failed to send password reset request.' };
    }
  },

  // --- Function for Reset Password Confirmation ---
  confirmPasswordReset: async (resetData) => {
    // No explicit authentication check here, relies on the implicit session
    // established by the Supabase client from the URL fragment.
    try {
      console.log("confirmPasswordReset service: Sending reset confirmation...");
      // resetData should be { new_password: "...", confirm_new_password: "..." }
      const response = await authApi.resetPassword(resetData);
      console.log("confirmPasswordReset service: Request successful.", response);
      // Clear local storage as the session is now invalid after reset
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log("Tokens and user cleared from localStorage after reset.");
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Confirm password reset service error:", error);
      // Clear local storage even on failure, as the reset token might be invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return { success: false, error: error.message || 'Password reset failed. Link may be invalid or expired.' };
    }
  },
  // --- End of Function ---

  // refreshToken: async () => { ... } // Add later if needed
};

export default authService;