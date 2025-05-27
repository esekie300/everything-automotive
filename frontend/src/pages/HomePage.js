// frontend/src/pages/HomePage.js
import React from 'react';
// Import the Hero component from its specified location
import Hero from '../components/pages/home/Hero';
// Removed import AIChatInterface as it's not rendered here anymore

// Accept the onOpenAIChat prop from App.js
function HomePage({ onOpenAIChat }) { // <<< ACCEPT PROP

  return (
    <>
      {/* Pass the onOpenAIChat function down to the Hero component */}
      <Hero onOpenAIChat={onOpenAIChat} /> {/* <<< PASS PROP */}

      {/* Add other sections for the home page later */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to Everything Automotive</h2>
        <p className="text-lg text-gray-700">Explore our services, parts, and vehicles.</p>
      </div>

      {/* Removed the modal rendering from here */}

    </>
  );
}
export default HomePage;