import { NextRequest, NextResponse } from 'next/server';
import { generateRestaurantDescription, AIConfig } from '@/lib/google-ai';

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
    const { restaurantName, cuisine, specialties, config } = body;

    // Validate input
    if (!restaurantName || typeof restaurantName !== 'string') {
      return NextResponse.json(
        { error: 'Restaurant name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!cuisine || typeof cuisine !== 'string') {
      return NextResponse.json(
        { error: 'Cuisine type is required and must be a string' },
        { status: 400 }
      );
    }

    if (!specialties || !Array.isArray(specialties)) {
      return NextResponse.json(
        { error: 'Specialties are required and must be an array' },
        { status: 400 }
      );
    }

    // Generate restaurant description
    const description = await generateRestaurantDescription(
      restaurantName,
      cuisine,
      specialties,
      config as AIConfig
    );

    return NextResponse.json({
      success: true,
      description,
      restaurantName,
      cuisine,
      specialties,
      model: config?.model || process.env.AI_MODEL_DEFAULT || 'gemini-1.5-flash',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in restaurant-description API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate restaurant description',
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
