import { useState, useCallback } from 'react';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  quickReplies?: string[];
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
  };
}

interface UseChatbotState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
}

// Main chatbot hook
export function useChatbot() {
  const [state, setState] = useState<UseChatbotState>({
    messages: [],
    loading: false,
    error: null,
    isTyping: false,
  });

  // Add welcome message on first load
  const [hasWelcomed, setHasWelcomed] = useState(false);

  if (!hasWelcomed && state.messages.length === 0) {
    setState(prev => ({
      ...prev,
      messages: [{
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: "Hi! I'm an AI assistant. I can help you with any questions or topics you'd like to discuss. How can I help you today?",
        timestamp: new Date().toISOString(),
      }]
    }));
    setHasWelcomed(true);
  }

  // Send message - No sessions needed!
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      // Send to simple chat API
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          conversationHistory: state.messages.slice(-6), // Last 6 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add AI response
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, data.message],
        isTyping: false,
      }));

      return data.message;

    } catch (error) {
      console.error('Error sending message:', error);

      setState(prev => ({
        ...prev,
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));

      throw error;
    }
  }, [state.messages]);

  // Clear chat
  const clearChat = useCallback(() => {
    setState({
      messages: [],
      loading: false,
      error: null,
      isTyping: false,
    });
    setHasWelcomed(false);
  }, []);

  return {
    // State
    messages: Array.isArray(state.messages) ? state.messages : [],
    loading: state.loading,
    error: state.error,
    isTyping: state.isTyping,

    // Actions
    sendMessage,
    clearChat,
  };
}


