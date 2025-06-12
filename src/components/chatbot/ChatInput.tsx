'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, FaceSmileIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
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
    
    if (message.trim() && !disabled) {
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

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className="bg-white border-t border-gray-200 max-md:flex-shrink-0">
      {/* Input Area - Facebook Messenger Style */}
      <div className="px-4 py-3 max-md:px-3 max-md:py-2">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          {/* Additional Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={disabled}
              className={`p-2 rounded-full transition-colors duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'text-orange-500 hover:bg-orange-50'
              }`}
              title="Add photo"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Message Input Container - Messenger Style */}
          <div className="flex-1 relative">
            <div className="chat-input-container flex items-end bg-gray-100 rounded-2xl px-3 py-2 min-h-[40px] transition-all duration-200 focus-within:bg-gray-50">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={disabled ? 'Chat is disabled' : placeholder}
                disabled={disabled}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-gray-900 placeholder:text-gray-500 text-sm leading-5"
                style={{
                  minHeight: '20px',
                  maxHeight: '100px',
                }}
              />

              {/* Emoji Button */}
              <button
                type="button"
                disabled={disabled}
                className={`ml-2 p-1 rounded-full transition-colors duration-200 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-500 hover:text-orange-500'
                }`}
                title="Add emoji"
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Character Count */}
            {message.length > 800 && (
              <div className="absolute -top-6 right-2 text-xs text-gray-500 bg-white px-1 rounded">
                {message.length}/1000
              </div>
            )}
          </div>

          {/* Send Button or Voice Button */}
          {message.trim() ? (
            <button
              type="submit"
              disabled={!canSend}
              className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                canSend
                  ? 'bg-orange-500 text-white hover:bg-orange-600 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={disabled}
              className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice message'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
