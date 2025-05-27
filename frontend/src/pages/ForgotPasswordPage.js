// frontend/src/pages/ForgotPasswordPage.js
import React from 'react';
import ForgotPasswordForm from '../components/forms/ForgotPasswordForm'; // Import the form

function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-200px)]">
      <ForgotPasswordForm />
    </div>
  );
}

export default ForgotPasswordPage;