'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatWindow from './ChatWindow';

interface ChatWidgetProps {
  customerInfo?: {
    name?: string;
    email?: string;
    orderId?: string;
    location?: string;
  };
  position?: 'bottom-right' | 'bottom-left';
  showWelcomeMessage?: boolean;
  autoOpen?: boolean;
  theme?: 'orange' | 'blue' | 'green';
}

export default function ChatWidget({
  customerInfo,
  position = 'bottom-right',
  autoOpen = false,
  theme = 'orange'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Theme colors
  const themeColors = {
    orange: {
      primary: 'from-orange-500 to-orange-600',
      hover: 'hover:from-orange-600 hover:to-orange-700',
      text: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    blue: {
      primary: 'from-blue-500 to-blue-600',
      hover: 'hover:from-blue-600 hover:to-blue-700',
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    green: {
      primary: 'from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
  };

  const colors = themeColors[theme];

  // Position classes - Added 20px more space (bottom-12 -> bottom-20, bottom-16 -> bottom-20)
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 max-md:bottom-20',
    'bottom-left': 'bottom-20 left-4 max-md:bottom-20',
  };



  // Auto-open after delay
  useEffect(() => {
    if (autoOpen && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Open after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [autoOpen, hasInteracted]);

  // Disable welcome message - focus on pure chat
  // useEffect(() => {
  //   if (showWelcomeMessage && !hasInteracted && !isOpen) {
  //     const timer = setTimeout(() => {
  //       setShowWelcome(true);
  //     }, 2000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showWelcomeMessage, hasInteracted, isOpen]);

  // useEffect(() => {
  //   if (showWelcome) {
  //     const timer = setTimeout(() => {
  //       setShowWelcome(false);
  //     }, 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [showWelcome]);

  const handleToggleChat = () => {
    setHasInteracted(true);
    
    if (isOpen) {
      if (isMinimized) {
        setIsMinimized(false);
      } else {
        setIsOpen(false);
        setIsMinimized(false);
      }
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleCloseChat}
        onMinimize={handleMinimizeChat}
        isMinimized={isMinimized}
        position={position}
        customerInfo={customerInfo}
      />

      {/* Floating Chat Button */}
      {!isOpen && (
        <div className={`fixed ${positionClasses[position]} z-[9999]`}>


          {/* Chat Button */}
          <button
            onClick={handleToggleChat}
            className={`w-14 h-14 bg-gradient-to-r ${colors.primary} ${colors.hover} text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group relative`}
            title="Open Tap2Go Assistant"
            style={{ zIndex: 9999 }}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />

            {/* Notification Dot */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </button>

          {/* Pulsing Ring Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30 animate-ping"></div>
        </div>
      )}

      {/* Keyboard Shortcut Listener */}
      {typeof window !== 'undefined' && (
        <div
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === '/') {
              e.preventDefault();
              handleToggleChat();
            }
          }}
          tabIndex={-1}
          className="sr-only"
        />
      )}

      {/* Global Styles for Chat Widget */}
      <style jsx global>{`
        @keyframes chatBounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        .chat-bounce {
          animation: chatBounce 2s ease-in-out infinite;
        }

        /* Custom scrollbar for chat messages */
        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* Smooth transitions for chat elements */
        .chat-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Focus styles for accessibility */
        .chat-widget button:focus {
          outline: 2px solid #f97316;
          outline-offset: 2px;
        }

        /* Mobile responsiveness - Full screen like Messenger */
        @media (max-width: 767px) {
          .chat-widget {
            width: 100vw !important;
            height: 100vh !important; /* Fallback for older browsers */
            height: 100dvh !important; /* Use dynamic viewport height for mobile */
            max-width: none !important;
            max-height: 100vh !important; /* Fallback */
            max-height: 100dvh !important; /* Dynamic viewport height */
            border-radius: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            overflow: hidden !important;
          }
        }

        /* Messenger-like smooth scrolling */
        .chat-messages {
          scroll-behavior: smooth;
        }

        /* Enhanced message bubble animations */
        .message-bubble {
          animation: messageSlideIn 0.3s ease-out;
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Input focus effects */
        .chat-input-container:focus-within {
          box-shadow: 0 0 0 2px rgba(243, 168, 35, 0.2);
        }
      `}</style>
    </>
  );
}
