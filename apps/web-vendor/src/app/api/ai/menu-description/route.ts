import { NextRequest, NextResponse } from 'next/server';
import { generateMenuItemDescription, AIConfig } from '@/lib/google-ai';

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
    const { itemName, ingredients, cuisine, config } = body;

    // Validate input
    if (!itemName || typeof itemName !== 'string') {
      return NextResponse.json(
        { error: 'Item name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredients are required and must be an array' },
        { status: 400 }
      );
    }

    if (!cuisine || typeof cuisine !== 'string') {
      return NextResponse.json(
        { error: 'Cuisine type is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate menu item description
    const description = await generateMenuItemDescription(
      itemName,
      ingredients,
      cuisine,
      config as AIConfig
    );

    return NextResponse.json({
      success: true,
      description,
      itemName,
      ingredients,
      cuisine,
      model: config?.model || process.env.AI_MODEL_DEFAULT || 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in menu-description API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate menu item description',
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
