/**
 * Create Payment Intent API Route
 * POST /api/payments/create-intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { PayMongoService } from '@/server/services/paymongoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { amount, description, orderId, customerId } = body;
    
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Amount is required and must be a number' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Validate amount range
    if (!PayMongoService.validateAmount(amount)) {
      return NextResponse.json(
        { error: 'Amount must be between ₱20.00 and ₱999,999.99' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await PayMongoService.createPaymentIntent({
      amount,
      description,
      statement_descriptor: 'Tap2Go Food Delivery',
      metadata: {
        order_id: orderId,
        customer_id: customerId,
        platform: 'tap2go',
        created_at: new Date().toISOString(),
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.data.id,
        client_key: paymentIntent.data.attributes.client_key,
        amount: paymentIntent.data.attributes.amount,
        currency: paymentIntent.data.attributes.currency,
        status: paymentIntent.data.attributes.status,
        description: paymentIntent.data.attributes.description,
        payment_method_allowed: paymentIntent.data.attributes.payment_method_allowed,
        created_at: paymentIntent.data.attributes.created_at,
      },
    });

  } catch (error) {
    console.error('Create Payment Intent API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
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
