// frontend/src/components/profile/ProfileDisplay.js
import React from 'react';
import helpers from '../../utils/helpers'; // Import helpers for formatting

function ProfileDisplay({ user }) {
  // Display a loading state or return null if user data isn't available yet
  // This check might be redundant if the parent page handles loading, but it's safe.
  if (!user) {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
    );
  }

  // Once user data is available, display it
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Profile Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        {/* Use grid for better layout on wider screens */}
        <div>
          <span className="font-medium text-gray-600 block text-sm">Full Name:</span>
          <span className="text-gray-800">{user.fullName || 'Not Provided'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600 block text-sm">Email:</span>
          <span className="text-gray-800">{user.email}</span> {/* Email usually not editable */}
        </div>
        <div>
          <span className="font-medium text-gray-600 block text-sm">Phone:</span>
          <span className="text-gray-800">{user.phone || 'Not Provided'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600 block text-sm">Account Type:</span>
          <span className="text-gray-800 capitalize">{user.accountType || 'Personal'}</span>
        </div>
        {/* Address spans full width below */}
        <div className="md:col-span-2">
          <span className="font-medium text-gray-600 block text-sm">Address:</span>
          <span className="text-gray-800 whitespace-pre-wrap">{user.address || 'Not Provided'}</span>
        </div>

        {/* Conditionally show Company Name if business account */}
        {user.accountType === 'business' && (
          <div className="md:col-span-2">
            <span className="font-medium text-gray-600 block text-sm">Company Name:</span>
            <span className="text-gray-800">{user.companyName || 'Not Provided'}</span>
          </div>
        )}
        <div className="md:col-span-2">
          <span className="font-medium text-gray-600 block text-sm">Member Since:</span>
          <span className="text-gray-800">{helpers.formatDate(user.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileDisplay;