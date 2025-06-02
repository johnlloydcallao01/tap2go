/**
 * Get Available Payment Methods API Route
 * GET /api/payments/methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymongoSecretClient } from '@/lib/paymongo';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching available payment methods from PayMongo...');
    
    // Fetch available payment methods from PayMongo
    const response = await paymongoSecretClient.get('/payment_methods');
    
    console.log('PayMongo response:', response.data);
    
    // Return the payment methods
    return NextResponse.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error('Get Payment Methods API Error:', error);

    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Response status:', axiosError.response?.status);
      console.error('Response data:', axiosError.response?.data);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment methods',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
