/**
 * PayMongo Simple Test API Route
 * GET /api/paymongo/simple-test
 *
 * A lightweight test to quickly verify PayMongo API credentials
 * Returns JSON data for the UI page
 */

import { NextResponse } from 'next/server';
import { paymongoSecretClient } from '@/lib/paymongo';

export async function GET() {
  try {
    console.log('🚀 Running PayMongo simple test...');
    
    // Check environment variables
    const publicKey = process.env.PAYMONGO_PUBLIC_KEY_LIVE;
    const secretKey = process.env.PAYMONGO_SECRET_KEY_LIVE;
    
    if (!publicKey || !secretKey) {
      return NextResponse.json({
        success: false,
        error: 'PayMongo API keys not configured',
        message: 'Please check your environment variables',
        required: [
          'PAYMONGO_PUBLIC_KEY_LIVE',
          'PAYMONGO_SECRET_KEY_LIVE'
        ]
      }, { status: 500 });
    }

    // Create a real payment intent with all available payment methods
    console.log('📡 Creating real PayMongo payment intent...');
    const testPayload = {
      data: {
        attributes: {
          amount: 30000, // ₱300.00 in centavos (sample order amount)
          currency: 'PHP',
          description: 'Tap2Go Sample Order - Chicken Adobo Rice Bowl + Iced Coffee',
          statement_descriptor: 'Tap2Go Order',
          payment_method_allowed: [
            'card',
            'gcash',
            'grab_pay',
            'paymaya'
          ],
          metadata: {
            order_id: `test_order_${Date.now()}`,
            customer_name: 'Test Customer',
            platform: 'tap2go_test'
          }
        }
      }
    };
    const response = await paymongoSecretClient.post('/payment_intents', testPayload);
    
    console.log('✅ PayMongo payment intent created successfully!');

    // Extract actual payment methods from PayMongo response
    const paymentIntentData = response.data?.data;
    const actualPaymentMethods = paymentIntentData?.attributes?.payment_method_allowed || [];

    console.log('Actual payment methods from PayMongo:', actualPaymentMethods);

    return NextResponse.json({
      success: true,
      message: '🎉 Real PayMongo payment intent created successfully!',
      timestamp: new Date().toISOString(),
      environment: 'LIVE (Production)',
      apiStatus: 'Connected',
      responseStatus: response.status,
      credentials: {
        publicKey: `${publicKey.substring(0, 12)}...`,
        secretKey: `${secretKey.substring(0, 12)}...`
      },
      realPaymentIntent: {
        id: paymentIntentData?.id,
        amount: paymentIntentData?.attributes?.amount,
        currency: paymentIntentData?.attributes?.currency,
        status: paymentIntentData?.attributes?.status,
        client_key: paymentIntentData?.attributes?.client_key,
        next_action: paymentIntentData?.attributes?.next_action,
        payment_method_allowed: actualPaymentMethods,
        description: paymentIntentData?.attributes?.description
      },
      supportedPaymentMethods: actualPaymentMethods,
      paymentMethodDetails: {
        card: {
          name: 'Credit/Debit Cards',
          description: 'Visa, Mastercard, JCB, American Express',
          icon: '💳',
          available: true
        },
        gcash: {
          name: 'GCash',
          description: 'Philippines\' leading mobile wallet',
          icon: '📱',
          available: true
        },
        grab_pay: {
          name: 'GrabPay',
          description: 'Southeast Asia\'s super app wallet',
          icon: '🚗',
          available: true
        },
        paymaya: {
          name: 'Maya',
          description: 'Digital financial services platform',
          icon: '🏦',
          available: true
        },
        billease: {
          name: 'BillEase',
          description: 'Buy now, pay later service',
          icon: '📅',
          available: true
        },
        dob: {
          name: 'Online Banking',
          description: 'Direct bank transfers',
          icon: '🏛️',
          available: true
        }
      }
    });

  } catch (error: unknown) {
    console.error('PayMongo simple test failed:', error);

    // Parse error details
    let errorDetails = 'Unknown error';
    let statusCode = 500;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            errors?: Array<{ detail?: string }>;
            message?: string;
          };
          headers?: unknown;
        };
        message?: string;
      };
      console.error('PayMongo API Error Response:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers
      });
      errorDetails = axiosError.response?.data?.errors?.[0]?.detail ||
                    axiosError.response?.data?.message ||
                    JSON.stringify(axiosError.response?.data) ||
                    axiosError.message ||
                    'Unknown error';
      statusCode = axiosError.response?.status || 500;
    } else if (error instanceof Error) {
      errorDetails = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: 'PayMongo API test failed',
      details: errorDetails,
      statusCode,
      timestamp: new Date().toISOString(),
      troubleshooting: [
        'Check if your PayMongo API keys are correct',
        'Verify your PayMongo account is active',
        'Ensure you have proper permissions',
        'Check your internet connection'
      ]
    }, { status: statusCode });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for simple PayMongo test.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for simple PayMongo test.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET for simple PayMongo test.' },
    { status: 405 }
  );
}
