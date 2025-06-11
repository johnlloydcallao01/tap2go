# 📧 Resend Email Integration Guide for Tap2Go

## Overview

This guide provides comprehensive instructions for integrating Resend email services into your Tap2Go food delivery platform. Resend offers a modern, developer-friendly email API with React Email template support.

## 🎯 Why Resend?

- **Developer Experience**: Modern API with excellent TypeScript support
- **React Email**: Native support for React-based email templates
- **Reliability**: High deliverability rates and robust infrastructure
- **Pricing**: Generous free tier (100 emails/day) with transparent pricing
- **Features**: Built-in analytics, webhooks, and domain management

## 📋 Prerequisites

1. **Domain Access**: You need access to your domain's DNS settings
2. **Resend Account**: Free account at [resend.com](https://resend.com)
3. **Email Address**: A professional email for testing

## 🚀 Step-by-Step Setup

### Phase 1: Account & Domain Setup

#### 1. Create Resend Account
```bash
# Visit https://resend.com/signup
# Sign up with your business email
# Verify your email address
```

#### 2. Add and Verify Your Domain
```bash
# Go to https://resend.com/domains
# Click "Add Domain"
# Enter your domain (e.g., tap2go.com)
```

#### 3. Configure DNS Records
Add these DNS records to your domain provider:

```dns
# Domain Verification
Type: TXT
Name: @
Value: resend-domain-verification=<your-verification-code>

# MX Record for Feedback Loop
Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10

# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

#### 4. Generate API Key
```bash
# Go to https://resend.com/api-keys
# Click "Create API Key"
# Name: "Tap2Go Production" or "Tap2Go Development"
# Permissions: Full access (production) or Sending access (development)
# Copy the API key (starts with "re_")
```

### Phase 2: Technical Integration

#### 1. Install Dependencies
```bash
npm install resend @react-email/components @react-email/render
```

#### 2. Configure Environment Variables
Add to your `.env.local`:

```bash
# Resend Email Service Configuration
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_RESEND_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM_NAME=Tap2Go
EMAIL_REPLY_TO=support@yourdomain.com
ENABLE_EMAIL_NOTIFICATIONS=true
```

#### 3. Run Setup Script
```bash
# Validate configuration
npm run email:setup

# Test with your email
npm run email:test your-email@example.com
```

## 📧 Email Templates

### Available Templates

1. **Order Confirmation** - Professional order receipt with itemized details
2. **Welcome Email** - Onboarding email for new users
3. **Password Reset** - Secure password reset with time-limited links
4. **Order Status Updates** - Real-time order tracking notifications

### Custom Template Example

```tsx
import React from 'react';
import { BaseEmailTemplate } from '@/components/emails/BaseEmailTemplate';
import { Text, Button } from '@react-email/components';

export const CustomEmail: React.FC<{ name: string }> = ({ name }) => (
  <BaseEmailTemplate title="Custom Email">
    <Text>Hello {name}!</Text>
    <Button href="https://tap2go.com">Visit Tap2Go</Button>
  </BaseEmailTemplate>
);
```

## 🔌 API Integration

### Send Email via API

```typescript
// POST /api/email/send
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'order_confirmation',
    recipients: ['customer@example.com'],
    data: {
      customerName: 'John Doe',
      orderId: 'order_123',
      orderNumber: 'TAP2024001',
      // ... other order data
    }
  })
});
```

### Integration with Notification System

```typescript
import { emailNotificationService } from '@/lib/notifications/emailNotificationService';

// Send order confirmation
await emailNotificationService.sendOrderConfirmation({
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  orderId: 'order_123',
  // ... other data
});

// Send welcome email
await emailNotificationService.sendWelcomeEmail({
  email: 'newuser@example.com',
  name: 'Jane Smith',
  role: 'customer',
  userId: 'user_456'
});
```

## 🧪 Testing

### Test Email Configuration
```bash
# Basic configuration test
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com", "testType": "basic"}'

# Order confirmation test
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com", "testType": "order_confirmation"}'
```

### Health Check
```bash
# Check email service status
curl http://localhost:3000/api/email/send
```

## 📊 Monitoring & Analytics

### Resend Dashboard
- **Email Logs**: View all sent emails and their status
- **Analytics**: Open rates, click rates, bounce rates
- **Webhooks**: Real-time delivery notifications
- **Domain Health**: SPF, DKIM, DMARC status

### Application Monitoring
```typescript
// Email sending with metadata
const result = await sendEmail({
  // ... email data
  metadata: {
    orderId: 'order_123',
    customerId: 'customer_456',
    campaign: 'order_confirmation'
  }
});

console.log('Email sent:', result.messageId);
```

## 🔒 Security Best Practices

### API Key Management
- **Environment Variables**: Never commit API keys to version control
- **Key Rotation**: Rotate API keys regularly
- **Permissions**: Use minimal required permissions

### Email Security
- **Domain Authentication**: Ensure SPF, DKIM, DMARC are properly configured
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Validation**: Validate email addresses before sending

## 💰 Pricing & Limits

### Free Tier
- **100 emails/day**
- **1 custom domain**
- **Basic features**

### Pro Plan ($20/month)
- **Unlimited emails**
- **10 custom domains**
- **Advanced analytics**
- **Priority support**

### Rate Limits
- **Free**: 100 emails/day
- **Pro**: No daily limits
- **API**: 10 requests/second

## 🛠️ Troubleshooting

### Common Issues

#### 1. Domain Not Verified
```bash
# Check DNS propagation
dig TXT yourdomain.com
nslookup -type=TXT yourdomain.com
```

#### 2. API Key Invalid
```bash
# Verify API key format (should start with "re_")
# Check environment variable is loaded correctly
echo $RESEND_API_KEY
```

#### 3. Emails Not Delivering
- Check spam folder
- Verify domain authentication
- Review Resend dashboard logs
- Ensure proper DNS configuration

#### 4. Template Rendering Issues
```typescript
// Test template rendering locally
import { render } from '@react-email/render';
const html = await render(YourEmailTemplate({ data }));
console.log(html);
```

## 🔄 Migration from Other Services

### From SendGrid
```typescript
// Old SendGrid code
sgMail.send({
  to: 'user@example.com',
  from: 'noreply@yourdomain.com',
  subject: 'Hello',
  html: '<p>Hello World</p>'
});

// New Resend code
await sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  template: React.createElement('p', {}, 'Hello World'),
  type: 'promotional'
});
```

## 📚 Additional Resources

- **Resend Documentation**: https://resend.com/docs
- **React Email**: https://react.email/
- **Domain Setup**: https://resend.com/domains
- **API Reference**: https://resend.com/docs/api-reference
- **Examples**: https://resend.com/examples

## 🆘 Support

### Getting Help
- **Resend Support**: support@resend.com
- **Documentation**: https://resend.com/docs
- **Community**: https://resend.com/discord

### Internal Support
- **Email Service Issues**: Check `/api/email/send` health endpoint
- **Template Issues**: Test with `/api/email/test`
- **Configuration**: Run `npm run email:setup`

---

**Next Steps**: After completing this setup, integrate email notifications into your order flow and user registration process for a complete email experience.
