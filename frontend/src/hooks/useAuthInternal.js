// frontend/src/hooks/useAuthInternal.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth';
import User from '../models/user';
import { supabase } from '../utils/supabaseClient'; // Import supabase client

function useAuthInternal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // General loading
  const [error, setError] = useState(null); // General auth errors
  const [isUpdating, setIsUpdating] = useState(false); // Profile update loading
  const [isChangingPassword, setIsChangingPassword] = useState(false); // Password change loading

  // --- State Variables for Forgot Password Request ---
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequestMessage, setResetRequestMessage] = useState(null);
  const [resetRequestError, setResetRequestError] = useState(null);

  // --- State Variables for Reset Password Confirmation ---
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetConfirmMessage, setResetConfirmMessage] = useState(null);
  const [resetConfirmError, setResetConfirmError] = useState(null);

  // --- NEW: State Variable for Registration Success Message ---
  const [registrationMessage, setRegistrationMessage] = useState(null);
  // --- End ---

  // --- loadUser function (modified slightly for clarity) ---
  const loadUser = useCallback(async (isInitialLoad = false) => {
    console.log(`[useAuthInternal] loadUser called. isInitialLoad: ${isInitialLoad}`);
    if (isInitialLoad) setLoading(true); // Only set loading on initial load or explicit refresh
    setError(null); // Clear previous errors on load attempt

    let sessionUser = null;
    let sessionError = null;
    const storedUser = authService.getCurrentUserFromStorage();
    const tokenExists = !!localStorage.getItem('accessToken'); // Check if token exists

    if (storedUser && tokenExists) {
        sessionUser = User.fromJSON(storedUser);
        console.log('[useAuthInternal] User found in localStorage:', sessionUser);
        // Verify token validity silently in background if needed
        // supabase.auth.getUser().catch(err => { /* Handle potential error */ });
    } else if (tokenExists) {
        console.log('[useAuthInternal] Token found, but no user in storage. Fetching from server...');
        const { success, data, error: fetchError } = await authService.fetchCurrentUserFromServer();
        if (success && data) {
            sessionUser = User.fromJSON(data);
            console.log('[useAuthInternal] User fetched successfully from server token:', sessionUser);
        } else {
            console.error('[useAuthInternal] Failed to fetch user from server token:', fetchError);
            sessionUser = null;
            sessionError = fetchError || 'Failed to verify session.';
            // Only logout if the error isn't simply 'No access token found'
            if (fetchError !== 'No access token found') {
                await authService.logout(); // Service handles clearing storage
            }
        }
    } else {
        console.log('[useAuthInternal] No user or token found in storage.');
        sessionUser = null;
    }

    setUser(sessionUser);
    if (sessionError) setError(sessionError); // Set error if fetch failed
    if (isInitialLoad) setLoading(false); // Stop loading indicator after initial load attempt
    console.log('[useAuthInternal] User load attempt complete.');
  }, []);
  // --- End loadUser function ---


  // --- useEffect for Initial Load and Auth State Changes ---
  useEffect(() => {
    console.log('[useAuthInternal] Mount effect running...');
    setLoading(true); // Start loading on mount

    // Initial load attempt
    loadUser(true); // Pass true to indicate it's the initial load

    // Subscribe to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[useAuthInternal] Supabase onAuthStateChange event: ${event}`);
        setError(null); // Clear errors on auth change

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session && session.user) {
            console.log('[useAuthInternal] Auth change: Session found. Fetching/updating profile...');
            // Fetch profile using the service client to ensure we get latest data
            // Use try/catch for robustness
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single(); // Use single() for expecting one row

                if (profileError && profileError.code !== 'PGRST116') { // Ignore 'PGRST116' (0 rows) for now
                    throw profileError;
                }

                if (profileData) {
                     const userProfile = User.fromJSON(profileData);
                     setUser(userProfile);
                     localStorage.setItem('user', JSON.stringify(userProfile)); // Update storage
                     localStorage.setItem('accessToken', session.access_token);
                     localStorage.setItem('refreshToken', session.refresh_token);
                     console.log('[useAuthInternal] Auth change: User state updated from session/profile.');
                } else {
                     // Profile might not exist yet if created by trigger and lookup is too fast
                     console.warn(`[useAuthInternal] Auth change: User session valid, but profile not found for ID ${session.user.id}. User might need to complete profile.`);
                     // Keep the basic user info from the session if profile is missing
                     const basicUser = { id: session.user.id, email: session.user.email, created_at: session.user.created_at };
                     setUser(User.fromJSON(basicUser)); // Set basic user info
                     localStorage.setItem('user', JSON.stringify(basicUser));
                     localStorage.setItem('accessToken', session.access_token);
                     localStorage.setItem('refreshToken', session.refresh_token);
                     // setError('User profile not found. Please complete your profile.'); // Optional: Set an error/message
                }
            } catch (error) {
                 console.error('[useAuthInternal] Auth change: Error fetching profile.', error);
                 setError('Failed to load user profile after authentication.');
                 setUser(null); // Clear user if profile fetch fails
                 localStorage.removeItem('user');
                 localStorage.removeItem('accessToken');
                 localStorage.removeItem('refreshToken');
            }
          } else {
             console.warn('[useAuthInternal] Auth change: SIGNED_IN/TOKEN_REFRESHED event without session data.');
             setUser(null);
             localStorage.removeItem('user');
             localStorage.removeItem('accessToken');
             localStorage.removeItem('refreshToken');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[useAuthInternal] Auth change: SIGNED_OUT event. Clearing user state.');
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        } else if (event === 'PASSWORD_RECOVERY') {
            console.log('[useAuthInternal] Auth change: PASSWORD_RECOVERY event. Temporary session active.');
            setLoading(false); // Ensure loading is false
        }
        // Stop loading indicator after handling auth change, unless it was PASSWORD_RECOVERY
        if (event !== 'PASSWORD_RECOVERY') {
             setLoading(false);
        }
      }
    );

    // --- Simplified Hash Handling ---
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
        console.log('[useAuthInternal] Access token found in hash. Clearing URL fragment.');
        setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            console.log('[useAuthInternal] URL Fragment Cleared.');
        }, 150);
    }
    // --- End Simplified Hash Handling ---

    // Cleanup listener on unmount
    return () => {
      console.log('[useAuthInternal] Cleaning up auth listener.');
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      } else if (authListener && authListener.subscription) {
          authListener.subscription.unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount
  // --- End useEffect ---


  // --- Login Function (RESTORED IMMEDIATE STATE UPDATE) ---
  const login = useCallback(async (credentials) => {
    console.log('[useAuthInternal] Attempting login...');
    setLoading(true);
    setError(null);
    setRegistrationMessage(null);
    const { success, data, error: loginError } = await authService.login(credentials);
    if (success && data) {
      // <<< IMMEDIATE STATE UPDATE >>>
      setUser(User.fromJSON(data));
      console.log('[useAuthInternal] Login successful. User state updated immediately.');
      // <<< END IMMEDIATE STATE UPDATE >>>
      setLoading(false); // Set loading false on success
      return { success: true };
    } else {
      setUser(null);
      console.log(`[useAuthInternal] Login failed. Setting error state to: '${loginError || 'Login failed'}'`);
      setError(loginError || 'Login failed');
      setLoading(false); // Set loading false on failure
      console.error('[useAuthInternal] Login failed:', loginError);
      return { success: false, error: loginError || 'Login failed' };
    }
  }, []);
  // --- End Login Function ---


  // --- Register Function ---
  const register = useCallback(async (userData) => {
    console.log('[useAuthInternal] Attempting registration...');
    setLoading(true);
    setError(null);
    setRegistrationMessage(null);
    console.log('[useAuthInternal] States cleared (error, registrationMessage)');

    const result = await authService.register(userData);
    console.log('[useAuthInternal] authService.register result:', JSON.stringify(result));

    if (!result.success) {
        setError(result.error || 'Registration failed');
        console.log('[useAuthInternal] Setting error state to:', result.error || 'Registration failed');
        setRegistrationMessage(null);
        console.log('[useAuthInternal] Ensured registrationMessage is null on error path.');
    } else {
        console.log('[useAuthInternal] Registration successful (API call).');
        const successMsg = result.data?.message || result.message || 'Registration processed.'; // Use result.message as fallback
        setRegistrationMessage(successMsg);
        console.log('[useAuthInternal] Setting registrationMessage state to:', successMsg);
        setError(null);
        console.log('[useAuthInternal] Ensured error is null on success path.');
    }
    setLoading(false);
    console.log('[useAuthInternal] Loading set to false.');
    return result;
  }, []);
  // --- End Register Function ---


  // --- Logout Function ---
  const logout = useCallback(async () => {
    console.log('[useAuthInternal] Logging out...');
    setLoading(true);
    setError(null);
    setRegistrationMessage(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
        console.error("[useAuthInternal] Supabase signout error:", signOutError);
        // Fallback to clearing storage manually
        await authService.logout(); // Service clears storage
        setUser(null); // Manually clear state if listener fails
    }
    // Listener should clear user state, but set loading false here
    setLoading(false);
    console.log('[useAuthInternal] Logout attempt complete.');
    return { success: !signOutError };
  }, []);
  // --- End Logout Function ---


  // --- Update Profile Function ---
  const updateProfile = useCallback(async (profileUpdateData) => {
    console.log('[useAuthInternal] Attempting profile update...');
    setIsUpdating(true);
    let updateSpecificError = null;
    const result = await authService.updateProfile(profileUpdateData);

    if (result.success && result.data) {
      setUser(result.data);
      localStorage.setItem('user', JSON.stringify(result.data));
      console.log('[useAuthInternal] Profile update successful, state updated.');
    } else if (result.success) {
        console.warn('[useAuthInternal] Profile update reported success, but no user data returned. Refetching user.');
        await loadUser(); // Use the internal loadUser
    } else {
      updateSpecificError = result.error || 'Profile update failed';
      console.error('[useAuthInternal] Profile update failed:', result.error);
    }
    setIsUpdating(false);
    return { success: result.success, error: updateSpecificError, message: result.message };
  }, [loadUser]);
  // --- End Update Profile Function ---


  // --- Change Password Function ---
  const changePassword = useCallback(async (passwordChangeData) => {
    console.log('[useAuthInternal] Attempting password change...');
    setIsChangingPassword(true);
    let changePasswordError = null;

    const result = await authService.changePassword(passwordChangeData);

    if (result.success) {
      console.log('[useAuthInternal] Password change successful (API).');
    } else {
      changePasswordError = result.error || 'Password change failed';
      console.error('[useAuthInternal] Password change failed:', result.error);
    }

    setIsChangingPassword(false);
    return { success: result.success, error: changePasswordError, message: result.message };

  }, []);
  // --- End Change Password Function ---


  // --- Request Password Reset Function ---
  const requestPasswordReset = useCallback(async (email) => {
    console.log('[useAuthInternal] Attempting password reset request...');
    setIsRequestingReset(true);
    setResetRequestMessage(null);
    setResetRequestError(null);

    const result = await authService.requestPasswordReset(email);

    if (result.success) {
      console.log('[useAuthInternal] Password reset request successful (API).');
      setResetRequestMessage(result.message);
    } else {
      console.error('[useAuthInternal] Password reset request failed:', result.error);
      setResetRequestError(result.error || 'Password reset request failed');
    }

    setIsRequestingReset(false);
    return { success: result.success, message: result.message, error: result.error };
  }, []);
  // --- End Request Password Reset Function ---


  // --- Confirm Password Reset Function ---
  const confirmPasswordReset = useCallback(async (resetData) => {
    console.log('[useAuthInternal] Attempting password reset confirmation...');
    setIsConfirmingReset(true);
    setResetConfirmMessage(null);
    setResetConfirmError(null);

    const result = await authService.confirmPasswordReset(resetData);

    if (result.success) {
      console.log('[useAuthInternal] Password reset confirmation successful (API).');
      setResetConfirmMessage(result.message);
      // User state should be cleared by the listener after implicit signout post-reset
    } else {
      console.error('[useAuthInternal] Password reset confirmation failed:', result.error);
      setResetConfirmError(result.error || 'Password reset confirmation failed');
    }

    setIsConfirmingReset(false);
    return { success: result.success, message: result.message, error: result.error };
  }, []);
  // --- End Confirm Password Reset Function ---


  // The object returned by the hook
  return {
    user,
    loading, // General auth loading
    error, // General auth error
    setError, // Expose setError
    isUpdating, // Profile update loading state
    isChangingPassword, // Password change loading state
    isAuthenticated: !!user && !loading, // Simplified check based on user state
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    reloadUser: () => loadUser(true), // Expose a way to force reload

    // --- Forgot Password Request State/Func ---
    isRequestingReset,
    resetRequestMessage,
    resetRequestError,
    requestPasswordReset,

    // --- Reset Password Confirmation State/Func ---
    isConfirmingReset,
    resetConfirmMessage,
    resetConfirmError,
    confirmPasswordReset,

    // --- Expose Registration Success Message ---
    registrationMessage,
  };
}

export default useAuthInternal;