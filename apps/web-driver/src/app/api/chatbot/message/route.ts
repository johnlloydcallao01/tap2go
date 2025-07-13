import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chatbot/ai-service';

// Send message to chatbot
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
    const { sessionId, message, context } = body;

    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required and must be a string' },
        { status: 400 }
      );
    }

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

    // Check if session exists
    const session = chatService.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found. Please start a new conversation.' },
        { status: 404 }
      );
    }

    // Check if session is still active
    if (session.status === 'ended') {
      return NextResponse.json(
        { error: 'Chat session has ended. Please start a new conversation.' },
        { status: 400 }
      );
    }

    // Send message and get AI response
    const aiResponse = await chatService.sendMessage(sessionId, message, context);

    // Get updated session status
    const updatedSession = chatService.getChatSession(sessionId);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionStatus: updatedSession?.status,
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
