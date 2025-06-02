/**
 * PayMongo Process Payment API Route
 * POST /api/paymongo/process-payment
 * 
 * Creates a real payment intent and processes payment with selected method
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymongoSecretClient } from '@/lib/paymongo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod, amount, description, customerInfo } = body;

    console.log('🚀 Processing real PayMongo payment:', {
      paymentMethod,
      amount,
      description
    });

    // Validate required fields
    if (!paymentMethod || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Payment method and amount are required'
      }, { status: 400 });
    }

    // Check API credentials
    const secretKey = process.env.PAYMONGO_SECRET_KEY_LIVE;
    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: 'PayMongo secret key not configured'
      }, { status: 500 });
    }

    // Create payment intent with specific payment method
    const paymentPayload = {
      data: {
        attributes: {
          amount: Math.round(amount * 100), // Convert to centavos
          currency: 'PHP',
          description: description || 'Tap2Go Order Payment',
          statement_descriptor: 'Tap2Go',
          payment_method_allowed: [paymentMethod],
          metadata: {
            order_id: `order_${Date.now()}`,
            customer_name: customerInfo?.name || 'Customer',
            customer_email: customerInfo?.email || '',
            platform: 'tap2go',
            payment_method: paymentMethod
          }
        }
      }
    };

    console.log('📡 Creating PayMongo payment intent...');
    const response = await paymongoSecretClient.post('/payment_intents', paymentPayload);
    
    const paymentIntentData = response.data?.data;
    
    console.log('✅ Payment intent created:', paymentIntentData?.id);

    // Create real payment methods and get actual checkout URLs
    let paymentMethodResponse = null;
    let checkoutUrl = null;
    let realPaymentFlow = false;

    // For e-wallets, create payment methods with proper redirect URLs
    if (paymentMethod === 'gcash' || paymentMethod === 'grab_pay' || paymentMethod === 'paymaya') {
      console.log(`📱 Creating REAL ${paymentMethod} payment method...`);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

      const paymentMethodPayload = {
        data: {
          attributes: {
            type: paymentMethod,
            billing: {
              name: 'Test Customer',
              email: 'test@tap2go.com',
              phone: '+639123456789'
            }
          }
        }
      };

      try {
        console.log('🚀 Creating payment method with PayMongo...');
        paymentMethodResponse = await paymongoSecretClient.post('/payment_methods', paymentMethodPayload);

        const paymentMethodId = paymentMethodResponse.data?.data?.id;
        console.log('✅ Payment method created:', paymentMethodId);

        // Attach payment method to payment intent with return URL
        const attachPayload = {
          data: {
            attributes: {
              payment_method: paymentMethodId,
              return_url: `${baseUrl}/payment-success?payment_intent=${paymentIntentData?.id}`
            }
          }
        };

        console.log('🔗 Attaching payment method to payment intent...');
        const attachResponse = await paymongoSecretClient.post(
          `/payment_intents/${paymentIntentData?.id}/attach`,
          attachPayload
        );

        console.log('📋 Attach response:', attachResponse.data?.data?.attributes);

        // Get the redirect URL for real payment processing
        const updatedPaymentIntent = attachResponse.data?.data?.attributes;
        const nextAction = updatedPaymentIntent?.next_action;

        if (nextAction?.type === 'redirect') {
          checkoutUrl = nextAction.redirect?.url;
          realPaymentFlow = true;
          console.log('🌐 REAL CHECKOUT URL CREATED:', checkoutUrl);
          console.log('🎯 This will redirect to actual', paymentMethod.toUpperCase(), 'payment page!');
        }

      } catch (pmError: any) {
        console.error('❌ Payment method creation/attachment error:', {
          status: pmError.response?.status,
          data: pmError.response?.data,
          message: pmError.message
        });

        // If attachment fails, try to get checkout URL from payment intent directly
        try {
          console.log('🔄 Trying alternative approach...');
          const piResponse = await paymongoSecretClient.get(`/payment_intents/${paymentIntentData?.id}`);
          const nextAction = piResponse.data?.data?.attributes?.next_action;
          if (nextAction?.type === 'redirect') {
            checkoutUrl = nextAction.redirect?.url;
            realPaymentFlow = true;
            console.log('🌐 Alternative checkout URL found:', checkoutUrl);
          }
        } catch (altError) {
          console.error('Alternative approach also failed:', altError);
        }
      }
    }

    // For card payments, we'll need a different approach
    if (paymentMethod === 'card') {
      console.log('💳 Card payment selected - would need card form integration');
      // Card payments typically require a frontend form with PayMongo.js
      // For now, we'll provide instructions
    }

    return NextResponse.json({
      success: true,
      message: realPaymentFlow
        ? `🚀 REAL ${paymentMethod.toUpperCase()} payment ready! Click to proceed to actual payment.`
        : `Payment intent created for ${paymentMethod}`,
      paymentIntent: {
        id: paymentIntentData?.id,
        amount: paymentIntentData?.attributes?.amount,
        currency: paymentIntentData?.attributes?.currency,
        status: paymentIntentData?.attributes?.status,
        client_key: paymentIntentData?.attributes?.client_key,
        payment_method: paymentMethod,
        description: paymentIntentData?.attributes?.description
      },
      paymentMethod: paymentMethodResponse?.data?.data || null,
      checkoutUrl,
      realPaymentFlow,
      nextSteps: getPaymentInstructions(paymentMethod, checkoutUrl, realPaymentFlow),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Process payment error:', error);
    
    let errorMessage = 'Payment processing failed';
    let statusCode = 500;
    
    if (error.response) {
      errorMessage = error.response.data?.errors?.[0]?.detail || 
                    error.response.data?.message || 
                    error.message;
      statusCode = error.response.status;
    } else {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
}

/**
 * Get payment instructions based on payment method
 */
function getPaymentInstructions(paymentMethod: string, checkoutUrl?: string | null, realPaymentFlow?: boolean) {
  const instructions: Record<string, any> = {
    gcash: {
      title: realPaymentFlow ? '🚀 REAL GCash Payment Ready!' : 'GCash Payment',
      steps: checkoutUrl ? [
        '🎯 Click "Proceed to GCash" below for REAL payment',
        '📱 You will be redirected to actual GCash payment page',
        '🔐 Log in with your real GCash account',
        '💰 Confirm the ₱300.00 payment amount',
        '✅ Complete the actual payment transaction',
        '🔄 You will be redirected back to Tap2Go after payment'
      ] : [
        'Open your GCash app',
        'Scan the QR code or enter merchant details',
        'Enter the payment amount: ₱300.00',
        'Confirm the payment'
      ],
      redirectUrl: checkoutUrl
    },
    grab_pay: {
      title: realPaymentFlow ? '🚀 REAL GrabPay Payment Ready!' : 'GrabPay Payment',
      steps: checkoutUrl ? [
        '🎯 Click "Proceed to GrabPay" below for REAL payment',
        '🚗 You will be redirected to actual GrabPay payment page',
        '🔐 Log in with your real Grab account',
        '💰 Confirm the ₱300.00 payment amount',
        '✅ Complete the actual payment transaction',
        '🔄 You will be redirected back to Tap2Go after payment'
      ] : [
        'Open your Grab app',
        'Go to GrabPay section',
        'Scan QR code or enter payment details',
        'Confirm payment'
      ],
      redirectUrl: checkoutUrl
    },
    paymaya: {
      title: realPaymentFlow ? '🚀 REAL Maya Payment Ready!' : 'Maya Payment',
      steps: checkoutUrl ? [
        '🎯 Click "Proceed to Maya" below for REAL payment',
        '🏦 You will be redirected to actual Maya payment page',
        '🔐 Log in with your real Maya account',
        '💰 Confirm the ₱300.00 payment amount',
        '✅ Complete the actual payment transaction',
        '🔄 You will be redirected back to Tap2Go after payment'
      ] : [
        'Open your Maya app',
        'Use QR code scanner or enter details',
        'Confirm payment amount',
        'Complete payment'
      ],
      redirectUrl: checkoutUrl
    },
    card: {
      title: 'Credit/Debit Card Payment',
      steps: [
        'Enter your card details',
        'Provide card number, expiry, and CVV',
        'Confirm billing information',
        'Complete 3D Secure verification if required'
      ]
    },
    billease: {
      title: 'BillEase Payment',
      steps: [
        'You will be redirected to BillEase',
        'Log in or create BillEase account',
        'Choose your payment plan',
        'Complete the application'
      ]
    },
    dob: {
      title: 'Online Banking',
      steps: [
        'Select your bank',
        'You will be redirected to your bank\'s website',
        'Log in to your online banking',
        'Authorize the payment'
      ]
    }
  };

  return instructions[paymentMethod] || {
    title: 'Payment Processing',
    steps: ['Follow the payment instructions', 'Complete the transaction']
  };
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to process payments.' },
    { status: 405 }
  );
}
