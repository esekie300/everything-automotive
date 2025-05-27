// frontend/src/components/forms/ResetPasswordForm.js
import React, { useState } from 'react'; // Removed useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use the context hook

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState(''); // Client-side validation errors

  // Get state and function from the hook
  const {
    confirmPasswordReset,
    isConfirmingReset,
    resetConfirmMessage,
    resetConfirmError,
  } = useAuth();

  const navigate = useNavigate();

  // REMOVED the useEffect hook that checked window.location.hash

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous client-side errors
    // Clear hook errors/messages before new attempt
    // Note: The hook itself should ideally clear its state on new action start,
    // but doing it here provides extra safety. Consider refactoring hook later.
    // setResetConfirmMessage(null); // Let hook manage this
    // setResetConfirmError(null);

    // Client-side validation
    if (newPassword !== confirmNewPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    const resetData = {
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };

    // Call the function from the hook
    const result = await confirmPasswordReset(resetData);

    if (result.success) {
      // Success message is handled by the hook state (resetConfirmMessage)
      // Redirect after a delay
      setTimeout(() => {
        navigate('/login');
      }, 4000); // Redirect to login after 4 seconds
    } else {
      // Error message is handled by the hook state (resetConfirmError)
      // No need to setFormError here unless you want specific client-side display
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>

      <form onSubmit={handleSubmit}>
        {/* Display Success Message */}
        {resetConfirmMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
            {resetConfirmMessage} Redirecting to login...
          </div>
        )}

        {/* Display Hook/Backend Error Message */}
        {resetConfirmError && !resetConfirmMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
            {resetConfirmError}
          </div>
        )}

        {/* Display Client-Side Form Error Message */}
        {formError && !resetConfirmMessage && !resetConfirmError && ( // Only show if no other messages
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 text-yellow-700 rounded text-sm">
            {formError}
          </div>
        )}


        {/* Only show the form fields if no success message */}
        {!resetConfirmMessage && (
          <>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                disabled={isConfirmingReset} // Disable while loading
              />
               <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
            </div>
            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                disabled={isConfirmingReset} // Disable while loading
              />
            </div>
            <button
              type="submit"
              disabled={isConfirmingReset} // Disable button when loading
              className={`w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ${
                isConfirmingReset ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isConfirmingReset ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
      </form>

      {/* Show login link only if reset wasn't successful yet */}
      {!resetConfirmMessage && (
        <p className="text-center text-sm text-gray-600 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}

export default ResetPasswordForm;