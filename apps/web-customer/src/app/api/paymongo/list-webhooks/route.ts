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
 * List PayMongo Webhooks
 * Shows all existing webhooks to verify our webhook exists
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

    // Get all webhooks from PayMongo
    const response = await fetch('https://api.paymongo.com/v1/webhooks', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayMongo webhook listing failed:', result);
      return NextResponse.json(
        { 
          error: 'Failed to list webhooks',
          details: result
        },
        { status: response.status }
      );
    }

    // Find our specific webhook
    const ourWebhook = result.data?.find((webhook: PayMongoWebhook) =>
      webhook.attributes.url === 'https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook'
    );

    return NextResponse.json({
      success: true,
      message: 'Webhooks retrieved successfully',
      totalWebhooks: result.data?.length || 0,
      ourWebhook: ourWebhook || null,
      ourWebhookExists: !!ourWebhook,
      allWebhooks: result.data
    });

  } catch (error: unknown) {
    const apiError = error as PayMongoApiError;
    console.error('Error listing PayMongo webhooks:', apiError);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: apiError.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
