import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDisplay from '../components/profile/ProfileDisplay';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

function UserProfilePage() {
  const { user, isAuthenticated, loading, updateProfile, isUpdating, error: authError } = useAuth();

  const [activeSection, setActiveSection] = useState('display');
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  useEffect(() => {
    console.log('[UserProfilePage] State Update:', {
        loading,
        isAuthenticated,
        activeSection,
        userExists: !!user
    });
  }, [loading, isAuthenticated, activeSection, user]);

  const handleSaveProfile = async (profileData) => {
    setUpdateError(null);
    setUpdateSuccess(null);
    console.log("UserProfilePage: handleSaveProfile called with:", profileData);
    const result = await updateProfile(profileData);

    if (result.success) {
      setUpdateSuccess(result.message || "Profile updated successfully!");
      setActiveSection('display');
      setTimeout(() => setUpdateSuccess(null), 4000);
    } else {
      setUpdateError(result.error || "Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setActiveSection('display');
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-gray-600">Loading account information...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

      {updateSuccess && activeSection === 'display' && (
        <div className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm transition-opacity duration-300">
          {updateSuccess}
        </div>
      )}

      {authError && activeSection === 'display' && (
         <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
           {typeof authError === 'string' ? authError : 'An authentication error occurred.'}
         </div>
       )}

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
        {activeSection === 'display' && (
          <>
            <ProfileDisplay user={user} />
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setActiveSection('changePassword')}
                className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveSection('editProfile')}
                className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}

        {activeSection === 'editProfile' && (
          <ProfileEditForm
            user={user}
            onSave={handleSaveProfile}
            onCancel={handleCancel}
            isSaving={isUpdating}
            error={updateError}
          />
        )}

        {activeSection === 'changePassword' && (
          <ChangePasswordForm
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;