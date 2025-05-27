// frontend/src/pages/ResetPasswordPage.js
import React from 'react';
import ResetPasswordForm from '../components/forms/ResetPasswordForm'; // Import the form

function ResetPasswordPage() {
  // This page component might handle extracting the token from the URL fragment
  // if needed, but currently, the Supabase client library and the hook's useEffect
  // handle the token implicitly when the page loads.
  // We just need to render the form.

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-200px)]">
      <ResetPasswordForm />
    </div>
  );
}

export default ResetPasswordPage;