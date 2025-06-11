'use client';

import React, { useEffect, useRef } from 'react';
import { XMarkIcon, MinusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChatbot } from '@/hooks/useChatbot';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  position?: 'bottom-right' | 'bottom-left';
  customerInfo?: {
    name?: string;
    email?: string;
    orderId?: string;
    location?: string;
  };
}

export default function ChatWindow({
  isOpen,
  onClose,
  onMinimize,
  isMinimized,
  position = 'bottom-right'
}: ChatWindowProps) {
  const {
    messages,
    loading,
    error,
    isTyping,
    sendMessage,
    clearChat,
  } = useChatbot();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle sending messages - Simple!
  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle restart chat
  const handleRestartChat = () => {
    clearChat();
  };

  if (!isOpen) return null;

  // Position classes for chat window
  const windowPositionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${windowPositionClasses[position]} z-50 max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:top-0`}>
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 max-md:rounded-none max-md:h-full max-md:w-full ${
          isMinimized ? 'w-80 h-16 max-md:w-full max-md:h-16' : 'w-96 h-[600px] max-md:w-full max-md:h-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Tap2Go Assistant</h3>
              <p className="text-xs text-orange-100">
                Online • AI-powered
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimize Button */}
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <MinusIcon className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors duration-200"
              title="Close chat"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>


            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 h-[440px] max-md:h-[calc(100vh-140px)] bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Starting chat...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-red-600 text-sm mb-3">{error}</p>
                    <button
                      onClick={handleRestartChat}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Welcome Message */}
                  {Array.isArray(messages) && messages.length === 1 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm">
                        👋 Welcome to Tap2Go! I&apos;m here to help you with orders, restaurant info, delivery questions, and more.
                      </p>
                    </div>
                  )}

                  {/* Messages */}
                  {Array.isArray(messages) && messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}



                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={loading}
              isTyping={isTyping}
              placeholder="Ask me anything about Tap2Go..."
            />
          </>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Chat minimized</span>
            </div>
            {Array.isArray(messages) && messages.length > 1 && (
              <div className="text-xs text-gray-500">
                {messages.length - 1} message{messages.length > 2 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
