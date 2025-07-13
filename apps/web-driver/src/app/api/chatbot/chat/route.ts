import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/google-ai';
import { AI_SYSTEM_PROMPT } from '@/lib/chatbot/ai-config';

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (process.env.ENABLE_AI_FEATURES !== 'true') {
      return NextResponse.json(
        { error: 'Chatbot service is not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1,000 characters)' },
        { status: 400 }
      );
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationContext = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    // Create prompt using AI configuration
    const prompt = `
${AI_SYSTEM_PROMPT}

## CONVERSATION HISTORY
${conversationContext}

## CURRENT USER MESSAGE
User: ${message}

Please respond following the guidelines above:
    `.trim();

    // Generate AI response
    const aiResponse = await generateText(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    // Create response message
    const responseMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: aiResponse.trim(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send messages.' },
    { status: 405 }
  );
}
