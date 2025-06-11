import { NextRequest, NextResponse } from 'next/server';
import { generateText, AIConfig } from '@/lib/google-ai';

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (process.env.ENABLE_AI_FEATURES !== 'true') {
      return NextResponse.json(
        { error: 'AI features are not enabled' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { prompt, config } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        { error: 'Prompt is too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Generate text
    const result = await generateText(prompt, config as AIConfig);

    return NextResponse.json({
      success: true,
      result,
      model: config?.model || process.env.AI_MODEL_DEFAULT || 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in generate-text API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
