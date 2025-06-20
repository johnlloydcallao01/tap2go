import { GoogleGenerativeAI } from '@google/generative-ai';
import { TAP2GO_KNOWLEDGE_BASE, FAQ_PATTERNS } from './knowledge-base';

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_AI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Chat session interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
  };
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: {
    userName?: string;
    location?: string;
    currentOrder?: string;
    preferredLanguage?: 'en' | 'fil';
    lastActivity: Date;
  };
  status: 'active' | 'ended' | 'escalated';
  createdAt: Date;
}

// AI Chat Service
export class Tap2GoChatService {
  private model;
  private chatSessions: Map<string, ChatSession> = new Map();

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40,
      },
    });
  }

  // Create a new chat session
  createChatSession(userId?: string): ChatSession {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      context: {
        lastActivity: new Date(),
      },
      status: 'active',
      createdAt: new Date(),
    };

    this.chatSessions.set(sessionId, session);
    return session;
  }

  // Get chat session
  getChatSession(sessionId: string): ChatSession | null {
    return this.chatSessions.get(sessionId) || null;
  }

  // Send message and get AI response
  async sendMessage(
    sessionId: string,
    userMessage: string,
    context?: Partial<ChatSession['context']>
  ): Promise<ChatMessage> {
    const session = this.getChatSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Update session context
    if (context) {
      session.context = { ...session.context, ...context };
    }
    session.context.lastActivity = new Date();

    // Add user message
    const userChatMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    session.messages.push(userChatMessage);

    // Detect intent and generate response
    const intent = this.detectIntent(userMessage);
    const aiResponse = await this.generateAIResponse(session, userMessage, intent);

    // Add AI response
    const aiChatMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      quickReplies: aiResponse.quickReplies,
      metadata: {
        intent,
        confidence: aiResponse.confidence,
        escalated: aiResponse.escalated,
      },
    };
    session.messages.push(aiChatMessage);

    // Check if escalation is needed
    if (aiResponse.escalated) {
      session.status = 'escalated';
    }

    return aiChatMessage;
  }

  // Detect user intent from message
  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, patterns] of Object.entries(FAQ_PATTERNS)) {
      if (Array.isArray(patterns) && patterns.some((pattern: string) => lowerMessage.includes(pattern))) {
        return intent;
      }
    }
    
    return 'general';
  }

  // Generate AI response
  private async generateAIResponse(
    session: ChatSession,
    userMessage: string,
    intent: string
  ): Promise<{
    content: string;
    quickReplies?: string[];
    confidence: number;
    escalated: boolean;
  }> {
    try {
      // Build conversation context
      const conversationHistory = session.messages
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Create enhanced prompt
      const prompt = this.buildPrompt(userMessage, intent, conversationHistory, session.context);

      // Generate response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Determine quick replies based on intent
      const quickReplies = this.getQuickReplies(intent);

      // Check if escalation is needed
      const escalated = this.shouldEscalate(userMessage, content);

      return {
        content: content.trim(),
        quickReplies,
        confidence: 0.8, // Could be enhanced with actual confidence scoring
        escalated,
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Let me connect you with our human support team who can assist you better.",
        quickReplies: ["Contact Support", "Try Again"],
        confidence: 0.1,
        escalated: true,
      };
    }
  }

  // Build AI prompt with context
  private buildPrompt(
    userMessage: string,
    intent: string,
    conversationHistory: string,
    context: ChatSession['context']
  ): string {
    const contextInfo = [
      context.userName ? `Customer name: ${context.userName}` : '',
      context.location ? `Customer location: ${context.location}` : '',
      context.currentOrder ? `Current order: ${context.currentOrder}` : '',
    ].filter(Boolean).join('\n');

    return `
${TAP2GO_KNOWLEDGE_BASE}

## CONVERSATION CONTEXT
${contextInfo}

## CONVERSATION HISTORY
${conversationHistory}

## CURRENT USER MESSAGE
User: ${userMessage}

## DETECTED INTENT
${intent}

## INSTRUCTIONS
1. Respond as Tap2Go's AI assistant based on the knowledge base above
2. Be helpful, friendly, and professional
3. Keep responses concise but informative (2-3 sentences max unless detailed info is needed)
4. Use Filipino-friendly English
5. If you need to escalate, clearly state you'll connect them with human support
6. Provide specific, actionable information when possible
7. If asking for order details, be specific about what information you need

Respond naturally and helpfully:
    `.trim();
  }

  // Get appropriate quick replies based on intent - Disabled for pure chat focus
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getQuickReplies(_intent: string): string[] {
    return []; // No quick replies - focus on pure conversation
  }

  // Determine if human escalation is needed
  private shouldEscalate(userMessage: string, aiResponse: string): boolean {
    const escalationKeywords = [
      'refund', 'complaint', 'angry', 'frustrated', 'legal', 'lawsuit',
      'food poisoning', 'sick', 'harassment', 'fraud', 'security',
      'manager', 'supervisor', 'human', 'person', 'representative'
    ];

    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Check if user explicitly asks for human help
    if (lowerMessage.includes('human') || lowerMessage.includes('person') || 
        lowerMessage.includes('representative') || lowerMessage.includes('manager')) {
      return true;
    }

    // Check for escalation keywords
    if (escalationKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return true;
    }

    // Check if AI response indicates uncertainty
    if (lowerResponse.includes("i don't know") || 
        lowerResponse.includes("i'm not sure") ||
        lowerResponse.includes("contact support")) {
      return true;
    }

    return false;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get welcome message
  getWelcomeMessage(): ChatMessage {
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: "Hi! I'm Tap2Go's AI assistant. I can help you track orders, find restaurants, answer questions about delivery, and more. How can I help you today?",
      timestamp: new Date(),
      quickReplies: [], // No quick replies - focus on pure conversation
    };
  }

  // Clean up old sessions (call periodically)
  cleanupOldSessions(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.chatSessions.entries()) {
      if (session.context.lastActivity < cutoffTime) {
        this.chatSessions.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const chatService = new Tap2GoChatService();
