// frontend/src/pages/AboutPage.js
import React from 'react';
// Import the About component from its specified location
import About from '../components/pages/about/About'; // Corrected path

function AboutPage() {
  return (
    // The padding is now handled within the About component itself for better control
    <div className="min-h-[calc(100vh-200px)]"> {/* Ensure minimum height */}
      <About />
    </div>
  );
}
export default AboutPage;