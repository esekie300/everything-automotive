// frontend/src/components/ai/AIChatBubble.js
import React from 'react';
import { FaCommentDots } from 'react-icons/fa'; // Using a chat icon

function AIChatBubble({ onOpenChat }) {
  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-6 right-6 z-40 // Positioned below Navbar (z-50) but above most content
                 bg-primary hover:bg-primary-dark text-white
                 w-14 h-14 rounded-full
                 flex items-center justify-center
                 shadow-lg hover:shadow-xl
                 transition-all duration-300 ease-in-out
                 transform hover:-translate-y-1"
      aria-label="Open AI Chat"
    >
      <FaCommentDots size={24} />
    </button>
  );
}

export default AIChatBubble;