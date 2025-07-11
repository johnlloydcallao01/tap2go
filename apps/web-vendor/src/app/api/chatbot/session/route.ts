import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/chatbot/ai-service';

// Create new chat session
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
    const { userId } = body;

    // Create new chat session
    const session = chatService.createChatSession(userId);

    // Get welcome message
    const welcomeMessage = chatService.getWelcomeMessage();

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        createdAt: session.createdAt,
      },
      welcomeMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create chat session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get existing chat session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = chatService.getChatSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        messages: session.messages,
        context: session.context,
        createdAt: session.createdAt,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error retrieving chat session:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
