import { NextResponse } from 'next/server';

/**
 * PayMongo API Error Interface
 */
interface PayMongoApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Create PayMongo Webhook
 * Creates a webhook endpoint that will receive PayMongo events
 */
export async function POST() {
  try {
    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY_LIVE;
    
    if (!PAYMONGO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    // PayMongo webhook creation payload
    const webhookData = {
      data: {
        attributes: {
          url: 'https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook',
          events: [
            'payment.paid',
            'payment.failed',
            'source.chargeable'
          ]
        }
      }
    };

    // Create webhook with PayMongo
    const response = await fetch('https://api.paymongo.com/v1/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayMongo webhook creation failed:', result);
      return NextResponse.json(
        { 
          error: 'Failed to create webhook',
          details: result
        },
        { status: response.status }
      );
    }

    console.log('PayMongo webhook created successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Webhook created successfully',
      webhook: result.data,
      webhookUrl: 'https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook'
    });

  } catch (error: unknown) {
    const apiError = error as PayMongoApiError;
    console.error('Error creating PayMongo webhook:', apiError);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: apiError.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
