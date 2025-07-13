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
 * PayMongo Webhook Interface
 */
interface PayMongoWebhook {
  id: string;
  attributes: {
    url: string;
    secret_key: string;
    events: string[];
  };
}

/**
 * Get PayMongo Webhook Secret
 * Retrieves the webhook secret for signature verification
 */
export async function GET() {
  try {
    const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY_LIVE;
    
    if (!PAYMONGO_SECRET_KEY) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    // Get our specific webhook details
    const response = await fetch('https://api.paymongo.com/v1/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayMongo webhook retrieval failed:', result);
      return NextResponse.json(
        { 
          error: 'Failed to get webhook details',
          details: result
        },
        { status: response.status }
      );
    }

    // Find our specific webhook
    const ourWebhook = result.data?.find((webhook: PayMongoWebhook) =>
      webhook.attributes.url === 'https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook'
    );

    if (!ourWebhook) {
      return NextResponse.json(
        { error: 'Our webhook not found' },
        { status: 404 }
      );
    }

    // Get the webhook secret
    const webhookSecret = ourWebhook.attributes.secret_key;

    return NextResponse.json({
      success: true,
      message: 'Webhook secret retrieved successfully',
      webhookId: ourWebhook.id,
      webhookSecret: webhookSecret,
      webhookUrl: ourWebhook.attributes.url,
      events: ourWebhook.attributes.events,
      instructions: {
        step1: 'Copy the webhookSecret value below',
        step2: 'Add it to Firebase Functions environment as PAYMONGO_WEBHOOK_SECRET',
        step3: 'Use: firebase functions:config:set paymongo.webhook_secret="YOUR_SECRET_HERE"'
      }
    });

  } catch (error: unknown) {
    const apiError = error as PayMongoApiError;
    console.error('Error getting PayMongo webhook secret:', apiError);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: apiError.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
