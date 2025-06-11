'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isTyping?: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  isTyping = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Focus on textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled && !isTyping) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    // Voice input functionality can be implemented here
    // For now, just toggle recording state
    setIsRecording(!isRecording);
    
    // Placeholder for voice recognition
    if (!isRecording) {
      // Start recording
      console.log('Voice recording started');
    } else {
      // Stop recording
      console.log('Voice recording stopped');
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !isTyping;

  return (
    <div className="border-t border-gray-200 bg-white p-4 max-md:p-3">
      {/* Typing Indicator */}
      {isTyping && (
        <div className="mb-3 flex items-center text-gray-500">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="ml-2 text-sm">Tap2Go Assistant is typing...</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3 max-md:space-x-2">
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={disabled}
          className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isRecording ? 'Stop recording' : 'Voice input'}
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Chat is disabled' : placeholder}
            disabled={disabled}
            rows={1}
            className={`w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 text-gray-900 placeholder:text-gray-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed text-gray-600' : 'bg-white'
            }`}
            style={{ 
              minHeight: '48px',
              maxHeight: '120px',
            }}
          />
          
          {/* Character Count */}
          {message.length > 800 && (
            <div className="absolute -top-6 right-2 text-xs text-gray-600 font-medium">
              {message.length}/1000
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 ${
            canSend
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>




    </div>
  );
}
