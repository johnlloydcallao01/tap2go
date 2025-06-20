/**
 * Email Sending API Route
 * Handles email sending requests for Tap2Go platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, EmailData, validateEmailConfig } from '@/lib/email/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import * as React from 'react';

// Rate limiting (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // emails per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Validate email configuration
    const configValidation = validateEmailConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service configuration error',
          details: configValidation.errors 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, data, recipients } = body;

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!type || !data || !recipients) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, data, recipients' 
        },
        { status: 400 }
      );
    }

    // Handle different email types
    let emailData: EmailData;

    switch (type) {
      case 'order_confirmation':
        emailData = {
          to: recipients,
          subject: `Order Confirmation - #${data.orderNumber}`,
          template: React.createElement(OrderConfirmationEmail, {
            customerName: data.customerName,
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            restaurantName: data.restaurantName,
            items: data.items,
            subtotal: data.subtotal,
            deliveryFee: data.deliveryFee,
            tax: data.tax,
            total: data.total,
            estimatedDeliveryTime: data.estimatedDeliveryTime,
            deliveryAddress: data.deliveryAddress,
            paymentMethod: data.paymentMethod,
            trackingUrl: data.trackingUrl
          }),
          type: 'order_confirmation',
          metadata: {
            orderId: data.orderId,
            customerId: data.customerId,
            restaurantId: data.restaurantId
          }
        };
        break;

      case 'welcome':
        emailData = {
          to: recipients,
          subject: 'Welcome to Tap2Go! 🎉',
          template: React.createElement('div', {},
            React.createElement('h1', {}, `Welcome to Tap2Go, ${data.name}!`),
            React.createElement('p', {}, 'Thank you for joining our food delivery platform.'),
            React.createElement('p', {}, 'Start exploring restaurants in your area and enjoy fast, reliable delivery.')
          ),
          type: 'welcome',
          metadata: {
            userId: data.userId,
            userRole: data.role
          }
        };
        break;

      case 'password_reset':
        emailData = {
          to: recipients,
          subject: 'Reset Your Tap2Go Password',
          template: React.createElement('div', {},
            React.createElement('h1', {}, 'Password Reset Request'),
            React.createElement('p', {}, `Hi ${data.name},`),
            React.createElement('p', {}, 'You requested to reset your password. Click the link below to create a new password:'),
            React.createElement('a', { 
              href: data.resetUrl,
              style: { 
                backgroundColor: '#f97316',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-block',
                margin: '16px 0'
              }
            }, 'Reset Password'),
            React.createElement('p', {}, 'This link will expire in 1 hour.'),
            React.createElement('p', {}, 'If you didn\'t request this, please ignore this email.')
          ),
          type: 'password_reset',
          metadata: {
            userId: data.userId,
            resetToken: data.resetToken
          }
        };
        break;

      case 'order_status_update':
        emailData = {
          to: recipients,
          subject: `Order Update - #${data.orderNumber}`,
          template: React.createElement('div', {},
            React.createElement('h1', {}, 'Order Status Update'),
            React.createElement('p', {}, `Hi ${data.customerName},`),
            React.createElement('p', {}, `Your order #${data.orderNumber} status has been updated:`),
            React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold', color: '#f97316' } }, data.status),
            React.createElement('p', {}, data.message || 'We\'ll keep you updated on any further changes.'),
            data.trackingUrl && React.createElement('a', {
              href: data.trackingUrl,
              style: {
                backgroundColor: '#f97316',
                color: 'white',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '6px',
                display: 'inline-block',
                margin: '16px 0'
              }
            }, 'Track Order')
          ),
          type: 'order_status_update',
          metadata: {
            orderId: data.orderId,
            status: data.status,
            customerId: data.customerId
          }
        };
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Unsupported email type: ${type}` 
          },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        metadata: result.metadata
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          metadata: result.metadata 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const configValidation = validateEmailConfig();
  
  return NextResponse.json({
    status: 'ok',
    emailService: {
      enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
      configured: configValidation.valid,
      errors: configValidation.errors
    },
    timestamp: new Date().toISOString()
  });
}
