// frontend/src/components/forms/ForgotPasswordForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use the context hook

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  // Get state and function from the hook
  const {
    requestPasswordReset,
    isRequestingReset,
    resetRequestMessage,
    resetRequestError,
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous messages/errors handled by the hook state
    // Call the function from the hook
    await requestPasswordReset(email);
    // The hook manages setting resetRequestMessage or resetRequestError
    // We don't need to navigate away automatically here, show the message
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Forgot Password</h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Enter your email address below, and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Display Success Message */}
        {resetRequestMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
            {resetRequestMessage}
          </div>
        )}

        {/* Display Error Message */}
        {resetRequestError && !resetRequestMessage && ( // Only show error if no success message
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
            {resetRequestError}
          </div>
        )}

        {/* Don't show the form again if the success message is displayed */}
        {!resetRequestMessage && (
          <>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                disabled={isRequestingReset} // Disable while loading
              />
            </div>
            <button
              type="submit"
              disabled={isRequestingReset} // Disable button when loading
              className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ${
                isRequestingReset ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isRequestingReset ? 'Sending...' : 'Send Reset Link'}
            </button>
          </>
        )}
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Remember your password?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Log in here
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;