'use client';

import React, { useEffect, useRef } from 'react';
import { XMarkIcon, MinusIcon } from '@heroicons/react/24/outline';
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
    <div className={`fixed ${windowPositionClasses[position]} z-50 max-md:inset-0`}>
      <div
        className={`chat-widget bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 max-md:rounded-none max-md:h-screen max-md:w-full max-md:flex max-md:flex-col ${
          isMinimized ? 'w-80 h-16 max-md:w-full max-md:h-16' : 'w-96 h-[600px] max-md:w-full max-md:h-screen'
        }`}
      >
        {/* Header - Facebook Messenger Style */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center space-x-3">
            {/* Avatar with online indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">T2G</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Tap2Go Assistant</h3>
              <p className="text-xs text-green-600 font-medium">Active now</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Action buttons - Messenger style */}
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              <MinusIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close chat"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>


            {/* Messages Area - Messenger Style */}
            <div className="flex-1 overflow-y-auto p-4 h-[440px] max-md:flex-1 max-md:h-auto bg-white">
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
                  {/* Welcome Message - Messenger Style */}
                  {Array.isArray(messages) && messages.length === 1 && (
                    <div className="mb-4 flex justify-center">
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
                        <p className="text-gray-600 text-xs text-center">
                          👋 Welcome to Tap2Go! I&apos;m here to help you with orders, restaurant info, delivery questions, and more.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {Array.isArray(messages) && messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                    />
                  ))}

                  {/* Typing Indicator - Messenger Style (appears in message area) */}
                  {isTyping && (
                    <div className="flex justify-start mb-2">
                      <div className="flex items-end space-x-2 max-w-[85%]">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 mb-1">
                          <span className="text-white text-xs font-bold">T2G</span>
                        </div>

                        {/* Typing bubble */}
                        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={loading}
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
