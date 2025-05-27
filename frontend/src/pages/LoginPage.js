// frontend/src/pages/LoginPage.js
import React from 'react';
import LoginForm from '../components/forms/LoginForm'; // Import the form

function LoginPage() {
  return (
    // Added padding for better layout
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-200px)]">
      {/* Render the LoginForm component */}
      <LoginForm />
    </div>
  );
}

export default LoginPage;