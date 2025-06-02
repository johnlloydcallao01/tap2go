/**
 * PayMongo Webhook Handler
 * POST /api/webhooks/paymongo
 * 
 * Handles payment events from PayMongo:
 * - payment.paid
 * - payment.failed
 * - payment.refunded
 */

import { NextRequest, NextResponse } from 'next/server';
import { PayMongoService } from '@/server/services/paymongoService';
import { db } from '@/lib/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('paymongo-signature');
    
    if (!signature) {
      console.error('Missing PayMongo signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (if webhook secret is configured)
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValidSignature = PayMongoService.verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      );
      
      if (!isValidSignature) {
        console.error('Invalid PayMongo webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Parse webhook event
    const event = JSON.parse(rawBody);
    const eventType = event.data.attributes.type;
    const eventData = event.data.attributes.data;

    console.log(`Received PayMongo webhook: ${eventType}`, {
      eventId: event.data.id,
      paymentId: eventData.id,
    });

    // Handle different event types
    switch (eventType) {
      case 'payment.paid':
        await handlePaymentPaid(eventData);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(eventData);
        break;
        
      case 'payment.refunded':
        await handlePaymentRefunded(eventData);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    // Return success response
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('PayMongo webhook handler error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentPaid(paymentData: any) {
  try {
    if (!db) {
      throw new Error('Database connection not available');
    }

    const database = db as Firestore; // Type assertion to help TypeScript
    const paymentId = paymentData.id;
    const paymentIntentId = paymentData.attributes.payment_intent_id;
    const amount = paymentData.attributes.amount;
    const metadata = paymentData.attributes.metadata || {};

    console.log('Processing successful payment:', {
      paymentId,
      paymentIntentId,
      amount,
      orderId: metadata.order_id,
    });

    // Update order status in Firestore
    if (metadata.order_id) {
      await database.collection('orders').doc(metadata.order_id).update({
        payment_status: 'paid',
        payment_id: paymentId,
        payment_intent_id: paymentIntentId,
        paid_amount: amount / 100, // Convert from centavos to pesos
        paid_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`Order ${metadata.order_id} marked as paid`);
    }

    // Store payment record
    await database.collection('payments').doc(paymentId).set({
      payment_id: paymentId,
      payment_intent_id: paymentIntentId,
      order_id: metadata.order_id,
      customer_id: metadata.customer_id,
      amount: amount / 100,
      currency: paymentData.attributes.currency,
      status: 'paid',
      payment_method: paymentData.attributes.source?.type || 'unknown',
      metadata,
      created_at: new Date(paymentData.attributes.created_at * 1000),
      paid_at: new Date(paymentData.attributes.paid_at * 1000),
      updated_at: new Date(),
    });

    console.log(`Payment record ${paymentId} stored successfully`);

  } catch (error) {
    console.error('Error handling payment.paid event:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentData: any) {
  try {
    if (!db) {
      throw new Error('Database connection not available');
    }

    const database = db as Firestore; // Type assertion to help TypeScript
    const paymentId = paymentData.id;
    const paymentIntentId = paymentData.attributes.payment_intent_id;
    const metadata = paymentData.attributes.metadata || {};

    console.log('Processing failed payment:', {
      paymentId,
      paymentIntentId,
      orderId: metadata.order_id,
    });

    // Update order status in Firestore
    if (metadata.order_id) {
      await database.collection('orders').doc(metadata.order_id).update({
        payment_status: 'failed',
        payment_id: paymentId,
        payment_intent_id: paymentIntentId,
        payment_error: paymentData.attributes.last_payment_error,
        updated_at: new Date(),
      });

      console.log(`Order ${metadata.order_id} marked as payment failed`);
    }

    // Store payment record
    await database.collection('payments').doc(paymentId).set({
      payment_id: paymentId,
      payment_intent_id: paymentIntentId,
      order_id: metadata.order_id,
      customer_id: metadata.customer_id,
      amount: paymentData.attributes.amount / 100,
      currency: paymentData.attributes.currency,
      status: 'failed',
      payment_method: paymentData.attributes.source?.type || 'unknown',
      error: paymentData.attributes.last_payment_error,
      metadata,
      created_at: new Date(paymentData.attributes.created_at * 1000),
      updated_at: new Date(),
    });

    console.log(`Failed payment record ${paymentId} stored successfully`);

  } catch (error) {
    console.error('Error handling payment.failed event:', error);
    throw error;
  }
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(paymentData: any) {
  try {
    if (!db) {
      throw new Error('Database connection not available');
    }

    const database = db as Firestore; // Type assertion to help TypeScript
    const paymentId = paymentData.id;
    const refundAmount = paymentData.attributes.refunds?.[0]?.amount || 0;
    const metadata = paymentData.attributes.metadata || {};

    console.log('Processing refunded payment:', {
      paymentId,
      refundAmount,
      orderId: metadata.order_id,
    });

    // Update order status in Firestore
    if (metadata.order_id) {
      await database.collection('orders').doc(metadata.order_id).update({
        payment_status: 'refunded',
        refund_amount: refundAmount / 100,
        refunded_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`Order ${metadata.order_id} marked as refunded`);
    }

    // Update payment record
    await database.collection('payments').doc(paymentId).update({
      status: 'refunded',
      refund_amount: refundAmount / 100,
      refunded_at: new Date(),
      updated_at: new Date(),
    });

    console.log(`Payment record ${paymentId} updated with refund information`);

  } catch (error) {
    console.error('Error handling payment.refunded event:', error);
    throw error;
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
