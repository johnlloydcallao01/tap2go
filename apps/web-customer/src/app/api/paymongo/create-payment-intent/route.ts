import { NextRequest, NextResponse } from 'next/server';

/**
 * PayMongo API Error Interface
 */
interface PayMongoApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Request Body Interface
 */
interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create PayMongo Payment Intent
 * Creates a payment intent for testing the complete webhook flow
 */
export async function POST(request: NextRequest) {
  try {
    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY_LIVE;

    if (!PAYMONGO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    const body: CreatePaymentIntentRequest = await request.json();
    const { amount, currency = 'PHP', description, metadata } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Amount and description are required' },
        { status: 400 }
      );
    }

    // Create payment intent with PayMongo
    const paymentIntentData = {
      data: {
        attributes: {
          amount: amount,
          payment_method_allowed: [
            'gcash',
            'grab_pay',
            'paymaya',
            'card'
          ],
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic'
            }
          },
          currency: currency,
          description: description,
          statement_descriptor: 'Tap2Go Order',
          metadata: metadata || {}
        }
      }
    };

    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentIntentData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayMongo payment intent creation failed:', result);
      return NextResponse.json(
        { 
          error: 'Failed to create payment intent',
          details: result
        },
        { status: response.status }
      );
    }

    console.log('PayMongo payment intent created successfully:', result.data.id);

    return NextResponse.json({
      success: true,
      message: 'Payment intent created successfully',
      paymentIntent: result.data,
      nextSteps: {
        step1: 'Use the client_key to create payment method on frontend',
        step2: 'Attach payment method to payment intent',
        step3: 'Confirm payment to trigger webhook',
        webhookUrl: 'https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook'
      },
      testInstructions: {
        note: 'This creates a payment intent. To test the complete flow:',
        instructions: [
          '1. Use the client_key to create a payment method',
          '2. Attach the payment method to this payment intent',
          '3. Confirm the payment to trigger the webhook',
          '4. Check Firebase Functions logs for webhook processing'
        ]
      }
    });

  } catch (error: unknown) {
    const apiError = error as PayMongoApiError;
    console.error('Error creating PayMongo payment intent:', apiError);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: apiError.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
