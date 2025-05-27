// frontend/src/App.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import RouteScrollToTop from './components/common/RouteScrollToTop';
import Preloader from './components/common/Preloader';

// Page Components
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// AI Chat Components
import AIChatInterface from './components/ai/AIChatInterface';
import AIChatBubble from './components/ai/AIChatBubble'; // <<< IMPORT THE NEW BUBBLE COMPONENT

// Basic CSS
import './App.css';

// Import useAuth
import { useAuth } from './context/AuthContext';
// Import aiService
import aiService from './services/ai';

// --- Protected Route Component (Keep as is) ---
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
// --- End Protected Route Component ---

// --- localStorage Keys (Keep as is) ---
const CHAT_STATE_STORAGE_KEY = 'aiChatState';
const CHAT_SESSION_STORAGE_KEY = 'aiChatSessionId';
// --- End localStorage Keys ---


function App() {
  const { isAuthenticated, logout } = useAuth();

  // --- State Initialization (Keep as is) ---
  const [isChatOpen, setIsChatOpen] = useState(() => {
      const savedState = localStorage.getItem(CHAT_STATE_STORAGE_KEY);
      return savedState ? JSON.parse(savedState).isOpen : false;
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [chatPosition, setChatPosition] = useState(() => {
      const savedState = localStorage.getItem(CHAT_STATE_STORAGE_KEY);
      return savedState ? JSON.parse(savedState).position : { x: 0, y: 0 };
  });
  const [sessionId] = useState(() => {
      const savedSessionId = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
      return savedSessionId || uuidv4();
  });
  const isStreamingAssistantMessage = useRef(false);
  // --- End State Initialization ---


  // Effect to save session ID (Keep as is)
  useEffect(() => {
      localStorage.setItem(CHAT_SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);


  // Effect to save open state and position (Keep as is)
  useEffect(() => {
      const stateToSave = {
          isOpen: isChatOpen,
          position: chatPosition,
      };
      localStorage.setItem(CHAT_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [isChatOpen, chatPosition]);


  // closeChat FUNCTION (Keep as is)
  const closeChat = useCallback(() => {
      setIsChatOpen(false);
      setChatError(null);
      setIsChatSending(false);
      isStreamingAssistantMessage.current = false;
      console.log("Chat closed (messages preserved).");
  }, []);


  // openChat FUNCTION (Keep as is)
  const openChat = useCallback(async () => {
      console.log(`[openChat] Called. Current messagesLength: ${chatMessages.length}`);
      setIsChatOpen(true);
      setChatError(null);

      if (chatMessages.length > 0) {
          console.log("[openChat] Reopening chat with existing messages. Skipping history fetch.");
          setIsChatSending(false);
          isStreamingAssistantMessage.current = false;
          return;
      }

      console.log("[openChat] No existing messages found OR first open. Proceeding to load.");
      if (isAuthenticated) {
          console.log("[openChat] Authenticated: Loading history...");
          setIsChatSending(true);
          isStreamingAssistantMessage.current = false;
          const result = await aiService.getChatHistory(sessionId);
          if (result.success) {
              const initialMessages = result.history.length > 0
                  ? result.history
                  : [{ sender: 'assistant', text: "Hello! I'm your AI Mechanic. How can I help you today?" }];
              setChatMessages(initialMessages);
              console.log(`[openChat] History loaded successfully. Messages count: ${initialMessages.length}`);
          } else {
              setChatError(result.error || "Failed to load chat history.");
              setChatMessages([{ sender: 'assistant', text: "Hello! I'm your AI Mechanic. How can I help you today?" }]);
              console.error(`[openChat] Failed to load history: ${result.error}`);
          }
          setIsChatSending(false);
      } else {
          console.log("[openChat] Not authenticated. Setting initial message.");
          setChatMessages([{ sender: 'assistant', text: "Hello! Please log in to chat." }]);
          setIsChatSending(false);
      }
  }, [isAuthenticated, sessionId, chatMessages.length]);


  // handleChunkReceived FUNCTION (Keep as is)
  const handleChunkReceived = useCallback((chunk) => {
      setChatMessages(prevMessages => {
          console.log('[handleChunkReceived] Chunk:', JSON.stringify(chunk)); // Stringify chunk

          if (!isStreamingAssistantMessage.current) {
              isStreamingAssistantMessage.current = true;
              if (chunk) {
                  const newMessage = { sender: 'assistant', text: chunk };
                  console.log('[handleChunkReceived] Adding new assistant message:', JSON.stringify(newMessage)); // Stringify new message
                  return [...prevMessages, newMessage];
              } else {
                  return prevMessages;
              }
          }
          const lastMessageIndex = prevMessages.length - 1;
          if (lastMessageIndex >= 0 && prevMessages[lastMessageIndex].sender === 'assistant') {
              const updatedMessage = { ...prevMessages[lastMessageIndex], text: prevMessages[lastMessageIndex].text + chunk };
              console.log('[handleChunkReceived] Updating last assistant message:', JSON.stringify(updatedMessage)); // Stringify updated message
              return [
                  ...prevMessages.slice(0, lastMessageIndex),
                  updatedMessage
              ];
          } else {
              console.warn("handleChunkReceived: Starting new assistant message unexpectedly.");
              isStreamingAssistantMessage.current = true;
              if (chunk) {
                  const newMessage = { sender: 'assistant', text: chunk };
                  console.log('[handleChunkReceived] Adding new assistant message (unexpected case):', JSON.stringify(newMessage)); // Stringify new message
                  return [...prevMessages, newMessage];
              } else {
                  return prevMessages;
              }
          }
      });
  }, []);


  // handleStreamEnd FUNCTION (Keep as is)
  const handleStreamEnd = useCallback(() => {
      console.log("App: Stream ended.");
      isStreamingAssistantMessage.current = false;
      setIsChatSending(false);
  }, []);


  // handleStreamError FUNCTION (Keep as is)
  const handleStreamError = useCallback(async (errorMsg) => {
      console.error("App: Stream error:", errorMsg);
      setChatError(errorMsg);
      isStreamingAssistantMessage.current = false;
      setIsChatSending(false);
      if (errorMsg.includes("401") || errorMsg.includes("Invalid or expired token") || errorMsg.includes("Authentication required")) {
          console.log("App: Logging out due to stream auth error.");
          await logout();
          setChatMessages([]);
          closeChat();
      }
  }, [logout, closeChat]);


  // sendChatMessage FUNCTION (Keep as is)
  const sendChatMessage = useCallback(async (message) => {
      if (!isAuthenticated) {
          setChatError("You must be logged in to chat with the AI Mechanic.");
          return;
      }
      if (isChatSending) return;

      const userMessageObj = { sender: 'user', text: message };
      console.log('[sendChatMessage] Adding user message:', JSON.stringify(userMessageObj));
      setChatMessages(prevMessages => [...prevMessages, userMessageObj]);

      setIsChatSending(true);
      setChatError(null);
      isStreamingAssistantMessage.current = false;

      await aiService.sendChatMessageStream(
          sessionId,
          message,
          handleChunkReceived,
          handleStreamEnd,
          handleStreamError
      );

  }, [isAuthenticated, isChatSending, sessionId, handleChunkReceived, handleStreamEnd, handleStreamError]);


  // Smooth scroll effect (keep as is)
  useEffect(() => {
    const smoothScrollHandler = (e) => {
      const targetId = e.currentTarget.getAttribute('href')?.substring(1);
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        e.preventDefault();
        const navbarHeight = document.querySelector('header')?.offsetHeight || 70;
        window.scrollTo({
          top: targetElement.offsetTop - navbarHeight,
          behavior: 'smooth'
        });
      }
    };
    const hashLinks = document.querySelectorAll('a[href^="#"]');
    hashLinks.forEach(anchor => {
      anchor.addEventListener('click', smoothScrollHandler);
    });
    return () => {
      hashLinks.forEach(anchor => {
        anchor.removeEventListener('click', smoothScrollHandler);
      });
    };
  }, []);


  // Log chatMessages state before render (Keep as is)
  console.log('[App Render] Current chatMessages state:', JSON.stringify(chatMessages, null, 2));


  // --- JSX Return ---
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background">
        <Preloader />
        {/* Pass closeChat to Navbar for mobile menu links */}
        <Navbar onCloseChat={closeChat} />
        <main className="flex-grow pt-[60px] md:pt-[68px]">
          <RouteScrollToTop />
          <Routes>
            {/* Public Routes */}
            {/* Pass openChat to HomePage */}
            <Route path="/" element={<HomePage onOpenAIChat={openChat} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* Add other public routes */}

            {/* Protected Routes */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Add other protected routes */}

          </Routes>
        </main>
        <Footer />
        <ScrollToTop />

        {/* AI Chat Interface (Modal) */}
        {isChatOpen && (
            <AIChatInterface
                messages={chatMessages}
                onSendMessage={sendChatMessage}
                isSending={isChatSending}
                error={chatError}
                onClose={closeChat}
                position={chatPosition}
                setPosition={setChatPosition}
            />
        )}

        {/* <<< RENDER THE CHAT BUBBLE PERSISTENTLY >>> */}
        {/* Only render the bubble if the chat interface itself is NOT open */}
        {!isChatOpen && (
            <AIChatBubble onOpenChat={openChat} />
        )}
        {/* <<< END BUBBLE RENDERING >>> */}

      </div>
    </Router>
  );
}

export default App;