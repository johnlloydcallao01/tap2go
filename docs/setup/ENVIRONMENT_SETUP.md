# 🔧 Tap2Go Environment Configuration Guide

## Overview
This guide documents all required environment variables and configuration steps for the Tap2Go food delivery platform.

⚠️ **SECURITY WARNING**: Never commit real API keys, secrets, or credentials to version control. Use placeholder values in documentation and store actual credentials securely in environment variables.

## 📋 Required Environment Variables

### Firebase Configuration
```bash
# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id

# Firebase Admin SDK (Backend - Only 3 variables needed!)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### PayMongo Configuration
```bash
# PayMongo Live Keys (Production)
PAYMONGO_PUBLIC_KEY_LIVE=pk_live_your_public_key_here
PAYMONGO_SECRET_KEY_LIVE=sk_live_your_secret_key_here
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE=pk_live_your_public_key_here
```

### Google Maps API
```bash
# Google Maps (Separate keys for security)
NEXT_PUBLIC_MAPS_FRONTEND_KEY=your_frontend_maps_api_key
MAPS_BACKEND_KEY=your_backend_maps_api_key
```

### Cloudinary Configuration
```bash
# Cloudinary Media Management
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Supabase Database Configuration
```bash
# Supabase Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# CMS Configuration
ENABLE_SUPABASE_CMS=true
```

### Upstash Redis Configuration (Enterprise Caching)
```bash
# Upstash Redis Credentials
UPSTASH_REDIS_REST_URL="https://your-redis-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token_here"

# Cache Configuration
ENABLE_REDIS_CACHING=true
REDIS_DEFAULT_TTL=3600
```

### Resend Email Service Configuration
```bash
# Resend API Configuration
RESEND_API_KEY=re_your_resend_api_key_here
NEXT_PUBLIC_RESEND_FROM_EMAIL=onboarding@resend.dev

# Email Configuration
ENABLE_EMAIL_NOTIFICATIONS=true
EMAIL_FROM_NAME=Tap2Go
EMAIL_REPLY_TO=onboarding@resend.dev
```

### Google AI Studio (Gemini) Configuration
```bash
# Google AI Studio API Key
# Get your API key from: https://aistudio.google.com/
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# AI Configuration
ENABLE_AI_FEATURES=true
AI_MODEL_DEFAULT=gemini-1.5-flash
```

### Elasticsearch Configuration
```bash
# Bonsai Elasticsearch (Search)
BONSAI_HOST=https://your-search-cluster.bonsaisearch.net:443
BONSAI_USERNAME=your_elasticsearch_username
BONSAI_PASSWORD=your_elasticsearch_password
```

## 🚀 Deployment Steps

### 1. Supabase Database Setup
```bash
# Install required dependencies
npm install @supabase/supabase-js

# Test Supabase connection
npm run db:test

# Set up database tables (if needed)
# Use Supabase Dashboard: https://supabase.com/dashboard
```

### 2. Upstash Redis Setup
```bash
# Install Redis client
npm install @upstash/redis

# Test Redis connection
npm run cache:test
```

### 3. Firebase Functions Deployment
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npx tsc

# Deploy to Firebase
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### 4. Environment Variables Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your actual values
nano .env.local

# Verify all services are working
npm run dev


```

### 5. PayMongo Webhook Configuration
```bash
# Webhook URL (after Firebase deployment)
https://us-central1-your-project-id.cloudfunctions.net/paymongoWebhook

# Webhook ID (for reference)
hook_your_webhook_id_here

# Webhook Secret (for signature verification)
whsk_your_webhook_secret_here
```

## 🔍 Verification Checklist

### Supabase Database
- [ ] Database connection working
- [ ] Tables created and accessible
- [ ] Row Level Security (RLS) configured
- [ ] API keys working correctly

### Upstash Redis Cache
- [ ] Redis connection established
- [ ] Cache operations working
- [ ] TTL settings configured
- [ ] Performance improvements visible

### Firebase Functions
- [ ] Functions deployed successfully
- [ ] Webhook URL accessible
- [ ] Logs showing no errors
- [ ] CORS enabled for web requests

### PayMongo Integration
- [ ] Webhook created and active
- [ ] Signature verification working
- [ ] Test payments processing
- [ ] Order status updates in Firestore

### Google AI Studio (Gemini)
- [ ] API key working
- [ ] AI features responding
- [ ] Model configuration correct
- [ ] Rate limits understood

### FCM Notifications
- [ ] VAPID key configured
- [ ] Service worker registered
- [ ] Notifications permission granted
- [ ] Test notifications working

### Environment Security
- [ ] All sensitive keys in environment variables
- [ ] No hardcoded credentials in code
- [ ] .env.local in .gitignore
- [ ] Production keys separate from development

## 🆘 Common Issues

### Firebase Functions Not Deploying
```bash
# Check Firebase CLI version
firebase --version

# Login again if needed
firebase login

# Check project selection
firebase use your-project-id

# Clear cache and retry
firebase functions:delete paymongoWebhook
firebase deploy --only functions
```

### PayMongo Webhook Not Receiving
```bash
# Check function logs
firebase functions:log --only paymongoWebhook

# Verify webhook URL
curl -X POST https://us-central1-your-project-id.cloudfunctions.net/paymongoWebhook

# Check PayMongo webhook status
# Visit: https://dashboard.paymongo.com/webhooks
```

### FCM Notifications Not Working
```bash
# Check VAPID key in browser console
console.log(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)

# Verify service worker registration
navigator.serviceWorker.getRegistrations()

# Check notification permission
Notification.permission
```

## 📞 Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Upstash Support**: https://upstash.com/docs
- **Firebase Support**: https://firebase.google.com/support
- **PayMongo Support**: https://developers.paymongo.com
- **Google Maps Support**: https://developers.google.com/maps/support
- **Cloudinary Support**: https://cloudinary.com/support
- **Google AI Studio**: https://aistudio.google.com/
- **Resend Support**: https://resend.com/docs

## 🔒 Security Best Practices

### Environment File Management
1. **Never commit real credentials** to version control
2. **Use `.env.example`** with placeholder values for documentation
3. **Add `.env.local` to `.gitignore`** to prevent accidental commits
4. **Use different credentials** for development, staging, and production
5. **Rotate API keys regularly** and revoke unused ones

### Creating .env.example File
Create a `.env.example` file in your project root with placeholder values:
```bash
# Copy this file to .env.local and fill in your actual values
# Never commit .env.local to version control

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
# ... (add all variables with placeholder values)
```

## 🔄 Update Procedures

### Adding New Environment Variables
1. Add to `.env.local` with real values
2. Add to `.env.example` with placeholder values
3. Update this documentation
4. Update deployment scripts if needed
5. Restart development server

### Rotating API Keys
1. Generate new keys in respective services
2. Update environment variables in all environments
3. Test functionality thoroughly
4. Deploy changes to production
5. Revoke old keys after confirming new ones work

---

**Last Updated**: June 2025
**Version**: 1.1 (Sanitized)
**Maintainer**: Development Team
