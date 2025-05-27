import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ChangePasswordForm({ onCancel }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { changePassword, isChangingPassword, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (currentPassword === newPassword) {
        setError('New password cannot be the same as the current password.');
        return;
    }

    const passwordData = {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };

    const result = await changePassword(passwordData);

    if (result.success) {
      setSuccessMessage(result.message || 'Password changed successfully! Logging out...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Password change failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Change Password</h3>

      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
          {successMessage}
        </div>
      )}

      {error && !successMessage && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Current Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isChangingPassword || !!successMessage}
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength="6"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isChangingPassword || !!successMessage}
        />
         <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
      </div>

      <div>
        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmNewPassword"
          name="confirmNewPassword"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
          minLength="6"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isChangingPassword || !!successMessage}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
         {onCancel && (
             <button
               type="button"
               onClick={onCancel}
               disabled={isChangingPassword || !!successMessage}
               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
             >
               Cancel
             </button>
         )}
        <button
          type="submit"
          disabled={isChangingPassword || !!successMessage}
          className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${
            (isChangingPassword || !!successMessage) ? 'cursor-not-allowed' : ''
          }`}
        >
          {isChangingPassword ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Changing...
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );
}

export default ChangePasswordForm;