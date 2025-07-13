/**
 * Email Testing API Route
 * Test email configuration and send test emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfig, sendEmail } from '@/lib/email/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import * as React from 'react';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail, testType = 'basic' } = body;

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    let result;

    if (testType === 'basic') {
      // Basic configuration test
      result = await testEmailConfig(testEmail);
    } else if (testType === 'order_confirmation') {
      // Test order confirmation email
      const mockOrderData = {
        customerName: 'John Doe',
        orderId: 'test_order_123',
        orderNumber: 'TAP2024001',
        restaurantName: 'Mario\'s Italian Kitchen',
        items: [
          {
            id: '1',
            name: 'Margherita Pizza',
            quantity: 1,
            price: 18.99,
            specialInstructions: 'Extra cheese please'
          },
          {
            id: '2',
            name: 'Caesar Salad',
            quantity: 1,
            price: 12.99
          }
        ],
        subtotal: 31.98,
        deliveryFee: 3.99,
        tax: 2.88,
        total: 38.85,
        estimatedDeliveryTime: '30-45 minutes',
        deliveryAddress: '123 Main St, Anytown, ST 12345',
        paymentMethod: 'Credit Card ending in 4242',
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track/test_order_123`
      };

      result = await sendEmail({
        to: testEmail,
        subject: `[TEST] Order Confirmation - #${mockOrderData.orderNumber}`,
        template: React.createElement(OrderConfirmationEmail, mockOrderData),
        type: 'order_confirmation',
        metadata: { test: true, testType: 'order_confirmation' }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid test type. Use "basic" or "order_confirmation"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      metadata: {
        ...result.metadata,
        testEmail,
        testType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: {
      method: 'POST',
      body: {
        testEmail: 'your-email@example.com',
        testType: 'basic | order_confirmation'
      }
    },
    examples: [
      {
        description: 'Basic configuration test',
        body: {
          testEmail: 'test@example.com',
          testType: 'basic'
        }
      },
      {
        description: 'Order confirmation email test',
        body: {
          testEmail: 'test@example.com',
          testType: 'order_confirmation'
        }
      }
    ]
  });
}
