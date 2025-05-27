// frontend/src/pages/ServicesPage.js
import React from 'react';
// Import the Services component from its specified location
import Services from '../components/pages/services/Services'; // Corrected path

function ServicesPage() {
  return (
    // Padding is handled within the Services component
    <div className="min-h-[calc(100vh-200px)]"> {/* Ensure minimum height */}
      <Services />
    </div>
  );
}
export default ServicesPage;