/**
 * Email Notification Service Integration
 * Integrates Resend email service with existing notification system
 */

import { sendEmail, EmailData, EmailType } from '@/lib/email/resend';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import * as React from 'react';

// Types for notification data
export interface NotificationEmailData {
  type: EmailType;
  recipient: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Email notification service class
export class EmailNotificationService {
  private static instance: EmailNotificationService;

  private constructor() {}

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderData: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    restaurantName: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      specialInstructions?: string;
    }>;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    estimatedDeliveryTime: string;
    deliveryAddress: string;
    paymentMethod: string;
    trackingUrl?: string;
  }) {
    const emailData: EmailData = {
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      template: React.createElement(OrderConfirmationEmail, {
        customerName: orderData.customerName,
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        restaurantName: orderData.restaurantName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
        total: orderData.total,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        trackingUrl: orderData.trackingUrl
      }),
      type: 'order_confirmation',
      metadata: {
        orderId: orderData.orderId,
        customerId: orderData.customerEmail,
        restaurantName: orderData.restaurantName
      }
    };

    return await sendEmail(emailData);
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userData: {
    email: string;
    name: string;
    role: 'customer' | 'vendor' | 'driver';
    userId: string;
  }) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tap2go.com';
    
    const emailData: EmailData = {
      to: userData.email,
      subject: 'Welcome to Tap2Go! 🎉',
      template: React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#f97316', fontSize: '24px' } }, `Welcome to Tap2Go, ${userData.name}!`),
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, 
          `Thank you for joining Tap2Go as a ${userData.role}. We're excited to have you on board!`
        ),
        userData.role === 'customer' && React.createElement('p', {}, 
          'Start exploring restaurants in your area and enjoy fast, reliable delivery.'
        ),
        userData.role === 'vendor' && React.createElement('p', {}, 
          'Set up your restaurant profile and start receiving orders from hungry customers.'
        ),
        userData.role === 'driver' && React.createElement('p', {}, 
          'Complete your driver verification and start earning by delivering delicious food.'
        ),
        React.createElement('a', {
          href: `${baseUrl}/${userData.role}`,
          style: {
            backgroundColor: '#f97316',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
            margin: '16px 0'
          }
        }, 'Get Started'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } },
          'Need help? Contact us at support@tap2go.com'
        )
      ),
      type: 'welcome',
      metadata: {
        userId: userData.userId,
        userRole: userData.role
      }
    };

    return await sendEmail(emailData);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(resetData: {
    email: string;
    name: string;
    resetUrl: string;
    userId: string;
    resetToken: string;
  }) {
    const emailData: EmailData = {
      to: resetData.email,
      subject: 'Reset Your Tap2Go Password',
      template: React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#1f2937', fontSize: '24px' } }, 'Password Reset Request'),
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, `Hi ${resetData.name},`),
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, 
          'You requested to reset your password. Click the button below to create a new password:'
        ),
        React.createElement('a', {
          href: resetData.resetUrl,
          style: {
            backgroundColor: '#f97316',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
            margin: '16px 0',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }, 'Reset Password'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } }, 
          'This link will expire in 1 hour for security reasons.'
        ),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } }, 
          'If you didn\'t request this password reset, please ignore this email or contact support if you have concerns.'
        )
      ),
      type: 'password_reset',
      metadata: {
        userId: resetData.userId,
        resetToken: resetData.resetToken
      }
    };

    return await sendEmail(emailData);
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(statusData: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderNumber: string;
    status: string;
    message?: string;
    trackingUrl?: string;
  }) {
    const emailData: EmailData = {
      to: statusData.customerEmail,
      subject: `Order Update - #${statusData.orderNumber}`,
      template: React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' } },
        React.createElement('h1', { style: { color: '#1f2937', fontSize: '24px' } }, 'Order Status Update'),
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, `Hi ${statusData.customerName},`),
        React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, 
          `Your order #${statusData.orderNumber} status has been updated:`
        ),
        React.createElement('p', { 
          style: { 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#f97316',
            padding: '12px',
            backgroundColor: '#fef3e2',
            borderRadius: '6px',
            textAlign: 'center'
          } 
        }, statusData.status),
        statusData.message && React.createElement('p', { style: { fontSize: '16px', lineHeight: '1.6' } }, statusData.message),
        statusData.trackingUrl && React.createElement('a', {
          href: statusData.trackingUrl,
          style: {
            backgroundColor: '#f97316',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
            margin: '16px 0'
          }
        }, 'Track Order'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } },
          'We\'ll keep you updated on any further changes to your order.'
        )
      ),
      type: 'order_status_update',
      metadata: {
        orderId: statusData.orderId,
        status: statusData.status
      }
    };

    return await sendEmail(emailData);
  }

  /**
   * Integration with existing notification system
   * This method can be called from your existing notification functions
   */
  async processNotificationEmail(notificationData: NotificationEmailData) {
    try {
      switch (notificationData.type) {
        case 'order_confirmation':
          return await this.sendOrderConfirmation({
            customerEmail: notificationData.recipient,
            customerName: notificationData.data.customerName as string,
            orderId: notificationData.data.orderId as string,
            orderNumber: notificationData.data.orderNumber as string,
            restaurantName: notificationData.data.restaurantName as string,
            items: notificationData.data.items as Array<{
              id: string;
              name: string;
              quantity: number;
              price: number;
              specialInstructions?: string;
            }>,
            subtotal: notificationData.data.subtotal as number,
            deliveryFee: notificationData.data.deliveryFee as number,
            tax: notificationData.data.tax as number,
            total: notificationData.data.total as number,
            estimatedDeliveryTime: notificationData.data.estimatedDeliveryTime as string,
            deliveryAddress: notificationData.data.deliveryAddress as string,
            paymentMethod: notificationData.data.paymentMethod as string,
            trackingUrl: notificationData.data.trackingUrl as string | undefined
          });

        case 'welcome':
          return await this.sendWelcomeEmail({
            email: notificationData.recipient,
            name: notificationData.data.name as string,
            role: notificationData.data.role as 'customer' | 'vendor' | 'driver',
            userId: notificationData.data.userId as string
          });

        case 'password_reset':
          return await this.sendPasswordResetEmail({
            email: notificationData.recipient,
            name: notificationData.data.name as string,
            resetUrl: notificationData.data.resetUrl as string,
            userId: notificationData.data.userId as string,
            resetToken: notificationData.data.resetToken as string
          });

        case 'order_status_update':
          return await this.sendOrderStatusUpdate({
            customerEmail: notificationData.recipient,
            customerName: notificationData.data.customerName as string,
            orderId: notificationData.data.orderId as string,
            orderNumber: notificationData.data.orderNumber as string,
            status: notificationData.data.status as string,
            message: notificationData.data.message as string | undefined,
            trackingUrl: notificationData.data.trackingUrl as string | undefined
          });

        default:
          console.warn(`Unsupported email notification type: ${notificationData.type}`);
          return { success: false, error: 'Unsupported notification type' };
      }
    } catch (error) {
      console.error('Email notification processing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const emailNotificationService = EmailNotificationService.getInstance();

// Helper function for easy integration with existing code
export async function sendNotificationEmail(
  type: EmailType,
  recipient: string,
  data: Record<string, unknown>,
  metadata?: Record<string, unknown>
) {
  return await emailNotificationService.processNotificationEmail({
    type,
    recipient,
    data,
    metadata
  });
}
