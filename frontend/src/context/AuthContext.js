// frontend/src/context/AuthContext.js
import React from 'react'; // Default import on its own line
import { createContext, useContext } from 'react'; // Named imports on their own line
import useAuthInternal from '../hooks/useAuthInternal.js'; // Assuming you renamed the hook file

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const auth = useAuthInternal(); // Use the original hook logic internally

  // The value provided will be the entire object returned by useAuthInternal
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// 3. Create a custom hook to consume the context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    // This error often happens if the component using useAuth is not wrapped by AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // It's safe to return the context directly now
  return context;
}

// Ensure you have default export if needed elsewhere, but named exports are fine for this setup.
// export default AuthContext; // Usually not needed if using the useAuth hook