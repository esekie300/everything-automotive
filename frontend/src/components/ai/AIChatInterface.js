// frontend/src/components/ai/AIChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown'; // <<< Restore import

function AIChatInterface({
    messages,
    onSendMessage,
    isSending,
    error,
    onClose,
    position,
    setPosition
}) {
  const { isAuthenticated } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const isDraggingRef = useRef(isDragging);
  useEffect(() => {
      isDraggingRef.current = isDragging;
  }, [isDragging]);


  // Scroll to the bottom using scrollTop
  useEffect(() => {
    const scrollContainer = messagesContainerRef.current;
    if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, messages[messages.length - 1]?.text]);


  // EFFECT 1: Handle Initial Positioning and Resize
  useEffect(() => {
    const chatElement = chatRef.current;
    if (!chatElement) return;

    const calculateAndSetPosition = () => {
        const bounds = chatElement.getBoundingClientRect();
        const elementWidth = bounds.width > 0 ? bounds.width : (window.innerWidth < 768 ? window.innerWidth - 32 : 384);
        const elementHeight = bounds.height > 0 ? bounds.height : (window.innerWidth < 768 ? window.innerHeight * 0.85 : 600);

        const isMobile = window.innerWidth < 768;
        const initialX = isMobile
            ? (window.innerWidth - elementWidth) / 2
            : window.innerWidth - elementWidth - 16;
        const initialY = window.innerHeight - elementHeight - 16;
        const finalY = Math.max(16, initialY);
        const finalX = Math.max(16, initialX);

        setPosition({ x: finalX, y: finalY });
    };

    const timeoutId = setTimeout(calculateAndSetPosition, 50);
    const handleResize = () => {
        if (!isDraggingRef.current) {
            calculateAndSetPosition();
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPosition]);


  // EFFECT 2: Handle Dragging Event Listeners
  useEffect(() => {
      const handleMouseMove = (e) => {
          if (!isDragging) return;
          e.preventDefault();

          const newX = e.clientX - dragOffset.current.x;
          const newY = e.clientY - dragOffset.current.y;

          const chatElement = chatRef.current;
          if (!chatElement) return;
          const bounds = chatElement.getBoundingClientRect();
          const boundedX = Math.max(0, Math.min(newX, window.innerWidth - bounds.width));
          const boundedY = Math.max(0, Math.min(newY, window.innerHeight - bounds.height));

          setPosition({ x: boundedX, y: boundedY });
      };

      const handleMouseUp = () => {
          setIsDragging(false);
      };

      if (isDragging) {
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, setPosition]);


  // Handle sending message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending || !isAuthenticated) return;

    const userMessage = inputMessage.trim();
    onSendMessage(userMessage);
    setInputMessage('');
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
      setIsDragging(true);
      const bounds = chatRef.current.getBoundingClientRect();
      dragOffset.current = {
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.y,
      };
      e.preventDefault();
  };

  // Touch Handlers for Dragging
  const handleTouchStart = (e) => {
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
      setIsDragging(true);
      const touch = e.touches[0];
      const bounds = chatRef.current.getBoundingClientRect();
      dragOffset.current = {
          x: touch.clientX - bounds.left,
          y: touch.clientY - bounds.y,
      };
  };

  const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.current.x;
      const newY = touch.clientY - dragOffset.current.y;

      const chatElement = chatRef.current;
      if (!chatElement) return;
      const bounds = chatElement.getBoundingClientRect();
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - bounds.width));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - bounds.height));

      setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchEnd = () => {
      setIsDragging(false);
  };

  // Keep the previous log
  console.log(`[AIChatInterface Render] isSending: ${isSending}, messagesLength: ${messages.length}, error: ${error}, isAuthenticated: ${isAuthenticated}`);

  // This component renders the chat interface content
  return (
    <div
        ref={chatRef}
        className="fixed bg-white rounded-lg shadow-xl p-4 flex flex-col z-50
                   w-calc-100-32 max-w-calc-100-32 h-[85vh]
                   md:w-96 md:max-w-md md:h-[600px]"
        style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div
          className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4 cursor-move flex-shrink-0"
          onMouseDown={handleMouseDown}
      >
          <h2 className="text-xl font-semibold text-gray-700">AI Mechanic</h2>
          {onClose && (
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none cursor-pointer p-1 -mr-1">
                  ×
              </button>
          )}
      </div>

      {/* Chat Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto border border-gray-200 rounded-lg mb-3 bg-gray-50 shadow-inner flex flex-col min-h-0"
      >
        <div className="p-3 flex-grow">
            {/* Loading State */}
            {isSending && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                    </div>
                    <span className="ml-3 text-gray-600">Loading history...</span>
                </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 italic p-4">
                Start a conversation with the AI Mechanic!
              </div>
            ) : (
              <div className="space-y-3">
                  {messages.map((msg, index) => {
                    // Keep the log for individual messages
                    console.log(`[AIChatInterface Map] Rendering message index ${index}:`, JSON.stringify(msg));
                    return (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`rounded-lg p-3 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-blue-100 text-gray-800'} mx-1 break-words max-w-[90%] sm:max-w-[80%] shadow-sm`}>
                            {/* --- MODIFIED: Restore ReactMarkdown --- */}
                            <div className="ai-message-content text-sm">
                                <ReactMarkdown
                                   components={{
                                       a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"/>,
                                       p: ({node, ...props}) => <p {...props} className="mb-1 last:mb-0"/>,
                                       ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside ml-4 mb-1"/>,
                                       ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside ml-4 mb-1"/>,
                                       li: ({node, ...props}) => <li {...props} className="mb-0.5"/>,
                                   }}
                                >{
                                    // Basic check for valid text content
                                    (typeof msg.text === 'string' && msg.text.trim() !== '') ? msg.text : `[Invalid Text: Type=${typeof msg.text}]`
                                }</ReactMarkdown>
                            </div>
                             {/* --- END MODIFICATION --- */}
                          </div>
                        </div>
                    );
                  })}
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm flex-shrink-0">
          {error}
        </div>
      )}

      {/* Message Input Form */}
      <div className="flex-shrink-0">
          <form onSubmit={handleSend} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder={isSending ? "AI thinking..." : (!isAuthenticated ? "Log in to chat..." : "Type your message...")}
              disabled={isSending || !isAuthenticated}
            />
            <button
              type="submit"
              className={`bg-primary hover:bg-primary-dark text-white font-bold py-2 px-3 rounded-md transition duration-300 flex-shrink-0 ${isSending || !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSending || !isAuthenticated}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
            {!isAuthenticated && (
                <p className="text-center text-xs text-gray-600 mt-2">
                    Please <a href="/login" onClick={onClose} className="text-primary hover:underline cursor-pointer">log in</a> to chat with the AI Mechanic.
                </p>
            )}
      </div>
    </div>
  );
}

export default AIChatInterface;