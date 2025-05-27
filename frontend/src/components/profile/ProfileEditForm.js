// frontend/src/components/profile/ProfileEditForm.js
import React, { useState, useEffect } from 'react';

function ProfileEditForm({ user, onSave, onCancel, isSaving, error }) {
  // Initialize form state based on user prop
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    company_name: '',
  });

  // Effect to pre-fill form when user data is available or changes
  useEffect(() => {
    if (user) {
      setFormData({
        // Use optional chaining and provide empty string fallback
        full_name: user?.fullName || '',
        phone: user?.phone || '',
        address: user?.address || '',
        company_name: user?.companyName || '',
      });
    }
  }, [user]); // Dependency array ensures this runs when user prop changes

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data for submission, ensuring keys match the backend UserProfileUpdate model (snake_case)
    // Send empty strings as null, as the backend Pydantic model handles Optional fields
    const updateData = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        // Only include company_name if account type is business
        ...(user?.accountType === 'business' && { company_name: formData.company_name.trim() || null }),
    };

    // Filter out null values *before* sending if the backend strictly requires only provided fields
    // However, Pydantic's `exclude_unset=True` on the backend model handles this better,
    // so sending nulls for empty fields is generally fine.
    // const filteredUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== null));

    onSave(updateData); // Pass the prepared data (with potential nulls) to the onSave handler from the parent page
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Edit Profile</h3>

       {/* Display specific update errors passed from the parent */}
       {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {/* Ensure error is a string before displaying */}
            {typeof error === 'string' ? error : 'An error occurred during update.'}
          </div>
        )}

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name" // Name must match the key in formData state
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSaving} // Disable input while saving
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel" // Use tel type for phone numbers
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="+234..."
          disabled={isSaving}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows="3"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSaving}
        />
      </div>

      {/* Conditionally show Company Name field based on user prop */}
      {user?.accountType === 'business' && (
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSaving}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button" // Important: type="button" to prevent form submission
          onClick={onCancel}
          disabled={isSaving} // Disable if saving
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving} // Disable if saving
          className={`inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 ${
            isSaving ? 'cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

export default ProfileEditForm;