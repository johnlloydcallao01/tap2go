'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/hooks/useChatbot';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isEscalated = message.metadata?.escalated;

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex items-end space-x-2 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar - Only show for assistant messages */}
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 mb-1">
            <span className="text-white text-xs font-bold">T2G</span>
          </div>
        )}

        <div className="flex flex-col">
          {/* Message Bubble - Facebook Messenger Style */}
          <div
            className={`message-bubble px-3 py-2 max-w-xs lg:max-w-md ${
              isUser
                ? 'bg-orange-500 text-white rounded-2xl rounded-br-md'
                : isEscalated
                ? 'bg-red-50 border border-red-200 text-red-800 rounded-2xl rounded-bl-md'
                : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Escalation Notice */}
            {isEscalated && (
              <div className="mt-2 p-2 bg-red-100 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 font-medium">
                  🚨 This conversation has been escalated to our human support team
                </p>
              </div>
            )}
          </div>

          {/* Timestamp - Messenger style */}
          <div className={`text-xs mt-1 px-1 ${isUser ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
            {formatTime(message.timestamp)}
            {message.metadata?.confidence && process.env.NODE_ENV === 'development' && (
              <span className="ml-2">
                • {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}
          </div>

          {/* Intent Badge (for debugging - can be removed in production) */}
          {!isUser && message.metadata?.intent && process.env.NODE_ENV === 'development' && (
            <div className="mt-1">
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                Intent: {message.metadata.intent}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
