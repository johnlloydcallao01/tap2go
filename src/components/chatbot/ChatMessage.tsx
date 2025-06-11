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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center mr-2">
              <span className="text-white text-sm font-bold">T2G</span>
            </div>
            <span className="text-xs text-gray-500">Tap2Go Assistant</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-orange-500 text-white rounded-br-md'
              : isEscalated
              ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
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

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isUser ? 'text-orange-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
            {message.metadata?.confidence && (
              <span className="ml-2">
                • {Math.round(message.metadata.confidence * 100)}% confidence
              </span>
            )}
          </div>
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
  );
}
