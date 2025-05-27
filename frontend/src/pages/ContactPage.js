// frontend/src/pages/ContactPage.js
import React from 'react';
// Import the Contact component from its specified location
import Contact from '../components/pages/contact/Contact'; // Corrected path

function ContactPage() {
  return (
    // The padding is now handled within the Contact component itself
    <div className="min-h-[calc(100vh-200px)]"> {/* Ensure minimum height */}
      <Contact />
    </div>
  );
}
export default ContactPage;