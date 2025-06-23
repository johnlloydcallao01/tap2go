/**
 * Resend Email Service for Tap2Go
 * Professional email service integration with React Email templates
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import React, { ReactElement } from 'react';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration with automatic domain detection
const isDevelopment = process.env.NODE_ENV === 'development';
const hasCustomDomain = process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL &&
  !process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL.includes('resend.dev');

export const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ||
    (isDevelopment ? 'onboarding@resend.dev' : 'noreply@tap2go.com'),
  FROM_NAME: process.env.EMAIL_FROM_NAME || 'Tap2Go',
  REPLY_TO: process.env.EMAIL_REPLY_TO ||
    (hasCustomDomain ? 'support@tap2go.com' : 'onboarding@resend.dev'),
  ENABLED: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  IS_DEVELOPMENT: isDevelopment,
  USING_TEST_DOMAIN: !hasCustomDomain,
} as const;

// Email types for the food delivery platform
export type EmailType = 
  | 'welcome'
  | 'order_confirmation'
  | 'order_status_update'
  | 'order_delivered'
  | 'order_cancelled'
  | 'password_reset'
  | 'email_verification'
  | 'vendor_application'
  | 'driver_application'
  | 'promotional'
  | 'receipt'
  | 'refund_processed';

// Email sending interface
export interface EmailData {
  to: string | string[];
  subject: string;
  template: ReactElement;
  type: EmailType;
  metadata?: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email sending result
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send email using Resend with React Email template
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    // Check if email service is enabled
    if (!EMAIL_CONFIG.ENABLED) {
      console.log('Email service disabled, skipping email send:', emailData.type);
      return {
        success: true,
        messageId: 'disabled',
        metadata: { reason: 'Email service disabled' }
      };
    }

    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Render React template to HTML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = await render(emailData.template as any);

    // Prepare email payload
    const emailPayload = {
      from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
      html,
      replyTo: EMAIL_CONFIG.REPLY_TO,
      attachments: emailData.attachments,
      tags: [
        { name: 'type', value: emailData.type },
        { name: 'environment', value: process.env.NODE_ENV || 'development' },
        { name: 'platform', value: 'tap2go' }
      ],
      headers: {
        'X-Email-Type': emailData.type,
        'X-Platform': 'Tap2Go',
      }
    };

    // Send email via Resend
    const response = await resend.emails.send(emailPayload);

    if (response.error) {
      console.error('Resend API error:', response.error);
      return {
        success: false,
        error: response.error.message || 'Failed to send email',
        metadata: { resendError: response.error }
      };
    }

    const logMessage = EMAIL_CONFIG.USING_TEST_DOMAIN
      ? `Email sent successfully using TEST DOMAIN: ${emailData.type} to ${emailData.to}`
      : `Email sent successfully: ${emailData.type} to ${emailData.to}`;

    console.log(logMessage);

    return {
      success: true,
      messageId: response.data?.id,
      metadata: {
        type: emailData.type,
        recipients: emailData.to,
        timestamp: new Date().toISOString(),
        usingTestDomain: EMAIL_CONFIG.USING_TEST_DOMAIN,
        fromEmail: EMAIL_CONFIG.FROM_EMAIL
      }
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
      metadata: { originalError: error }
    };
  }
}

/**
 * Send bulk emails (for promotional campaigns)
 */
export async function sendBulkEmails(emails: EmailData[]): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  
  // Process emails in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchPromises = batch.map(email => sendEmail(email));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          error: result.reason?.message || 'Batch email failed',
          metadata: { batchIndex: i + index }
        });
      }
    });

    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY environment variable is required');
  }

  if (!EMAIL_CONFIG.FROM_EMAIL) {
    errors.push('FROM_EMAIL configuration is required');
  }

  if (EMAIL_CONFIG.FROM_EMAIL && !EMAIL_CONFIG.FROM_EMAIL.includes('@')) {
    errors.push('FROM_EMAIL must be a valid email address');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Test email configuration
 */
export async function testEmailConfig(testEmail: string): Promise<EmailResult> {
  try {
    const validation = validateEmailConfig();
    if (!validation.valid) {
      return {
        success: false,
        error: `Configuration errors: ${validation.errors.join(', ')}`
      };
    }

    // Create a simple test email
    const testEmailData: EmailData = {
      to: testEmail,
      subject: 'Tap2Go Email Service Test',
      template: React.createElement('div', {}, 
        React.createElement('h1', {}, 'Email Service Test'),
        React.createElement('p', {}, 'This is a test email from Tap2Go email service.'),
        React.createElement('p', {}, `Sent at: ${new Date().toISOString()}`)
      ),
      type: 'promotional',
      metadata: { test: true }
    };

    return await sendEmail(testEmailData);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test email failed'
    };
  }
}

export default resend;
