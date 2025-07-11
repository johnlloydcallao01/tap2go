/**
 * Get Payment Intent Status API Route
 * GET /api/payments/status/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { PayMongoService } from '@/server/services/paymongoService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const clientKey = searchParams.get('client_key');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Get payment intent status
    const paymentIntent = await PayMongoService.getPaymentIntent(id, clientKey || undefined);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.data.id,
        status: paymentIntent.data.attributes.status,
        amount: paymentIntent.data.attributes.amount,
        currency: paymentIntent.data.attributes.currency,
        description: paymentIntent.data.attributes.description,
        next_action: paymentIntent.data.attributes.next_action,
        last_payment_error: paymentIntent.data.attributes.last_payment_error,
        payments: paymentIntent.data.attributes.payments,
        created_at: paymentIntent.data.attributes.created_at,
        updated_at: paymentIntent.data.attributes.updated_at,
      },
    });

  } catch (error) {
    console.error('Get Payment Intent Status API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get payment intent status',
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
