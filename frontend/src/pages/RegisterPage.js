// frontend/src/pages/RegisterPage.js
import React from 'react';
import RegisterForm from '../components/forms/RegisterForm'; // Import the form

function RegisterPage() {
  return (
    // Added padding for better layout
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-200px)]">
      {/* Remove the placeholder h1 and p tags */}
      {/* <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
      <p className="text-center text-gray-700">Registration form component will be placed here.</p> */}

      {/* Render the RegisterForm component */}
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;