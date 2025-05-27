// frontend/src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your .env file for React
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Automatically handle refreshing tokens, session persistence, etc.
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true // IMPORTANT: This allows Supabase to detect the session from the URL fragment (#access_token=...)
    }
});

// Optional: Log session changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase Auth State Change]', event, session);
    // You could potentially update your AuthContext user state here as well,
    // although our current hook relies more on manual fetching/storage.
    // This listener is crucial for handling events like PASSWORD_RECOVERY.
    if (event === 'PASSWORD_RECOVERY') {
        console.log('[Supabase Auth] Password recovery event detected. Session potentially established.');
        // The temporary session should now be active in the client.
        // The ResetPasswordForm can now make the API call.
    }
     if (event === 'SIGNED_IN') {
        console.log('[Supabase Auth] SIGNED_IN event detected.');
        // Potentially trigger user reload if needed, though login function handles it
    }
    if (event === 'SIGNED_OUT') {
        console.log('[Supabase Auth] SIGNED_OUT event detected.');
        // Ensure local state is cleared if this happens unexpectedly
    }
     if (event === 'TOKEN_REFRESHED') {
        console.log('[Supabase Auth] TOKEN_REFRESHED event detected.');
        // Update local storage if necessary, though Supabase client might handle it
        if (session?.access_token) {
            localStorage.setItem('accessToken', session.access_token);
        }
         if (session?.refresh_token) {
            localStorage.setItem('refreshToken', session.refresh_token);
        }
    }
});