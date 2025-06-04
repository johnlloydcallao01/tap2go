# 🔧 Tap2Go Troubleshooting Guide

## Overview
This guide helps resolve common issues with the Tap2Go food delivery platform, covering Firebase Functions, PayMongo webhooks, FCM notifications, and general deployment problems.

## 🚨 Common Issues & Solutions

### Firebase Cloud Functions Issues

#### 1. Function Deployment Fails
```bash
Error: Failed to deploy functions
```

**Solutions:**
```bash
# Check Firebase CLI version (should be latest)
firebase --version
npm install -g firebase-tools@latest

# Re-authenticate
firebase logout
firebase login

# Check project selection
firebase use tap2go-kuucn

# Clear cache and retry
firebase functions:delete paymongoWebhook
firebase deploy --only functions

# Check TypeScript compilation
cd functions
npx tsc
```

#### 2. Function Not Receiving Webhooks
```bash
Error: Function exists but not receiving PayMongo webhooks
```

**Solutions:**
```bash
# Check function URL accessibility
curl -X POST https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook

# Verify function logs
firebase functions:log --only paymongoWebhook

# Check PayMongo webhook configuration
# Visit: https://dashboard.paymongo.com/webhooks
# Verify URL: https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook

# Test webhook manually
curl -X POST https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook \
  -H "Content-Type: application/json" \
  -H "paymongo-signature: test" \
  -d '{"test": "data"}'
```

#### 3. Authentication Errors
```bash
Error: Unauthenticated function calls
```

**Solutions:**
```bash
# Allow unauthenticated invocations
gcloud functions add-iam-policy-binding paymongoWebhook \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker

# Or update function configuration
# Add invoker: "public" to function options
```

### PayMongo Integration Issues

#### 1. Webhook Signature Verification Fails
```bash
Error: Invalid webhook signature
```

**Solutions:**
```bash
# Verify webhook secret
echo $PAYMONGO_WEBHOOK_SECRET
# Should be: whsk_SjGyCUrQADFmAnKbHRMugjfT

# Check signature header format
# PayMongo sends: paymongo-signature: <hex_signature>

# Verify HMAC calculation
node -e "
const crypto = require('crypto');
const payload = 'your_payload';
const secret = 'whsk_SjGyCUrQADFmAnKbHRMugjfT';
const signature = crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
console.log('Expected signature:', signature);
"
```

#### 2. Payment Processing Fails
```bash
Error: Payment intent creation failed
```

**Solutions:**
```bash
# Check PayMongo API keys
echo $PAYMONGO_SECRET_KEY_LIVE
# Should start with: sk_live_

# Verify minimum amount (₱20.00 = 2000 centavos)
# PayMongo requires minimum 2000 centavos

# Test API connection
curl -X GET https://api.paymongo.com/v1/payment_intents \
  -H "Authorization: Basic $(echo -n 'sk_live_your_key:' | base64)"

# Check PayMongo dashboard for errors
# Visit: https://dashboard.paymongo.com/
```

#### 3. Webhook Not Created
```bash
Error: Failed to create PayMongo webhook
```

**Solutions:**
```bash
# Create webhook manually via API
curl -X POST https://api.paymongo.com/v1/webhooks \
  -H "Authorization: Basic $(echo -n 'sk_live_your_key:' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "attributes": {
        "url": "https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook",
        "events": ["source.chargeable", "payment.paid", "payment.failed"]
      }
    }
  }'

# Verify webhook exists
curl -X GET https://api.paymongo.com/v1/webhooks \
  -H "Authorization: Basic $(echo -n 'sk_live_your_key:' | base64)"
```

### Firebase Cloud Messaging Issues

#### 1. VAPID Key Not Configured
```bash
Error: VAPID key not configured
```

**Solutions:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_FIREBASE_VAPID_KEY
# Should be: BIZ720hEPOJI1onp93mfqutx5ceyFakOJPRM8R-Oa8eJibI5jsntq4PH-erjRy502Ac823zPQ63BTV5_qWxQUoQ

# Add to .env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BIZ720hEPOJI1onp93mfqutx5ceyFakOJPRM8R-Oa8eJibI5jsntq4PH-erjRy502Ac823zPQ63BTV5_qWxQUoQ

# Restart development server
npm run dev
```

#### 2. Service Worker Not Registered
```bash
Error: Service worker registration failed
```

**Solutions:**
```bash
# Check service worker file exists
ls public/firebase-messaging-sw.js

# Verify service worker registration in browser
# Open DevTools → Application → Service Workers
# Should show: firebase-messaging-sw.js

# Clear browser cache and reload
# Chrome: DevTools → Application → Storage → Clear storage

# Check console for registration errors
console.log(navigator.serviceWorker.getRegistrations());
```

#### 3. Notification Permission Denied
```bash
Error: Notification permission denied
```

**Solutions:**
```bash
# Check permission status
console.log(Notification.permission);

# Reset permission (Chrome)
# Settings → Privacy and security → Site Settings → Notifications
# Find localhost:3000 and reset

# Request permission programmatically
Notification.requestPermission().then(console.log);

# Clear browser data and try again
```

#### 4. FCM Token Generation Fails
```bash
Error: Failed to generate FCM token
```

**Solutions:**
```bash
# Check Firebase configuration
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

# Verify messaging initialization
import { getMessaging, isSupported } from 'firebase/messaging';
isSupported().then(console.log);

# Check browser compatibility
# FCM requires HTTPS in production
# Use localhost for development

# Clear localStorage and try again
localStorage.clear();
```

### Environment Configuration Issues

#### 1. Environment Variables Not Loading
```bash
Error: Environment variables undefined
```

**Solutions:**
```bash
# Check .env.local exists
ls -la .env.local

# Verify variable names (must start with NEXT_PUBLIC_ for client-side)
grep NEXT_PUBLIC_ .env.local

# Restart development server after changes
npm run dev

# Check variables in browser console
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

#### 2. Firebase Admin SDK Issues
```bash
Error: Firebase Admin SDK initialization failed
```

**Solutions:**
```bash
# Check private key format
echo $FIREBASE_ADMIN_PRIVATE_KEY | head -c 50

# Ensure newlines are properly escaped
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Verify service account email
echo $FIREBASE_ADMIN_CLIENT_EMAIL
# Should end with: @tap2go-kuucn.iam.gserviceaccount.com

# Test admin SDK initialization
node -e "
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\\\n/g, '\n'),
  }),
});
console.log('Admin SDK initialized successfully');
"
```

### Development Server Issues

#### 1. Port Already in Use
```bash
Error: Port 3000 already in use
```

**Solutions:**
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001

# Find and kill process manually
lsof -ti:3000 | xargs kill -9
```

#### 2. Module Not Found Errors
```bash
Error: Module not found
```

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Check import paths
# Use @/ for src/ directory imports
import { FCMService } from '@/lib/fcm';
```

## 🔍 Debugging Tools

### Firebase Functions Debugging
```bash
# Real-time function logs
firebase functions:log --only paymongoWebhook

# Specific time range
firebase functions:log --only paymongoWebhook --since 1h

# Local function testing
firebase functions:shell
```

### PayMongo API Testing
```bash
# Test payment intent creation
curl -X POST https://api.paymongo.com/v1/payment_intents \
  -H "Authorization: Basic $(echo -n 'sk_live_your_key:' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "attributes": {
        "amount": 2000,
        "payment_method_allowed": ["gcash"],
        "currency": "PHP",
        "description": "Test payment"
      }
    }
  }'
```

### FCM Testing
```bash
# Test notification sending
curl -X POST http://localhost:3000/api/test-fcm-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "type": "payment_success"
  }'
```

## 📞 Getting Help

### Log Analysis
1. **Firebase Functions**: `firebase functions:log`
2. **Browser Console**: Check for JavaScript errors
3. **Network Tab**: Verify API calls and responses
4. **Application Tab**: Check service worker and storage

### Support Resources
- **Firebase Support**: https://firebase.google.com/support
- **PayMongo Support**: https://developers.paymongo.com
- **Next.js Documentation**: https://nextjs.org/docs

### Emergency Contacts
- **Developer**: johnlloydcallao@gmail.com
- **Firebase Project**: tap2go-kuucn
- **PayMongo Account**: Business verified account

---

**Last Updated**: June 2025  
**Version**: 1.0  
**Maintainer**: John Lloyd Callao (johnlloydcallao@gmail.com)
