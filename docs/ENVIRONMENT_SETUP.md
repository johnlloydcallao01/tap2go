# 🔧 Tap2Go Environment Configuration Guide

## Overview
This guide documents all required environment variables and configuration steps for the Tap2Go food delivery platform.

## 📋 Required Environment Variables

### Firebase Configuration
```bash
# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tap2go-kuucn.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tap2go-kuucn
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tap2go-kuucn.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=828629511294
NEXT_PUBLIC_FIREBASE_APP_ID=1:828629511294:web:fae32760ca3c3afcb87c2f

# Firebase Admin SDK (Backend)
FIREBASE_ADMIN_PROJECT_ID=tap2go-kuucn
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tap2go-kuucn.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PRIVATE_KEY_CONTENT]\n-----END PRIVATE KEY-----\n"

# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BIZ720hEPOJI1onp93mfqutx5ceyFakOJPRM8R-Oa8eJibI5jsntq4PH-erjRy502Ac823zPQ63BTV5_qWxQUoQ
```

### PayMongo Configuration
```bash
# PayMongo Live Keys (Production)
PAYMONGO_PUBLIC_KEY_LIVE=pk_live_UJhfSgBMCUEM7JsmPHVr9Qb7
PAYMONGO_SECRET_KEY_LIVE=sk_live_awrzTYbxEhL5nSgN21F7vRfd
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE=pk_live_UJhfSgBMCUEM7JsmPHVr9Qb7
```

### Google Maps API
```bash
# Google Maps (Separate keys for security)
NEXT_PUBLIC_MAPS_FRONTEND_KEY=AIzaSyDWWpv5PBQFpfIkHmtOnHTGktHv5o36Cnw
MAPS_BACKEND_KEY=AIzaSyAhGLoNGg-gMgpDmiMdVk2POptR219SGT4
```

### Cloudinary Configuration
```bash
# Cloudinary Media Management
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpekh75yi
CLOUDINARY_API_KEY=191284661715922
CLOUDINARY_API_SECRET=G-_izp68I2eJuZOCvAKOmPkTXdI
```

### Hybrid Database Configuration (Prisma + Neon)
```bash
# Neon PostgreSQL Database (Primary Database)
DATABASE_URL=postgresql://tap2godb_owner:npg_ru51KZGMFTlt@ep-winter-river-a118fvup-pooler.ap-southeast-1.aws.neon.tech/tap2godb?sslmode=require
DATABASE_SSL=true
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=60000

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY=false
PRISMA_HIDE_UPDATE_MESSAGE=true

# Feature Flags
ENABLE_HYBRID_DATABASE=true
ENABLE_STRAPI_INTEGRATION=false
ENABLE_CONTENT_CACHING=true
```

### Elasticsearch Configuration
```bash
# Bonsai Elasticsearch (Search)
BONSAI_HOST=https://tap2go-search-2942013819.ap-southeast-2.bonsaisearch.net:443
BONSAI_USERNAME=SF5gQKJtVA
BONSAI_PASSWORD=bKJCacZSz8h27HxjXEeYVd
```

## 🚀 Deployment Steps

### 1. Hybrid Database Setup
```bash
# Install required dependencies
npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless ws @types/ws

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Test hybrid database connection
npm run db:test

# Seed sample data (optional)
curl -X POST http://localhost:3000/api/database/test -H "Content-Type: application/json" -d '{"action":"seed"}'
```

### 2. Firebase Functions Deployment
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

### 3. Environment Variables Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your actual values
nano .env.local

# Create .env file for Prisma CLI
echo "DATABASE_URL=your_neon_connection_string" > .env

# Restart development server
npm run dev
```

### 3. PayMongo Webhook Configuration
```bash
# Webhook URL (after Firebase deployment)
https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook

# Webhook ID (for reference)
hook_3osd3qmD6geceE3iKxjiepFR

# Webhook Secret (for signature verification)
whsk_SjGyCUrQADFmAnKbHRMugjfT
```

## 🔍 Verification Checklist

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
firebase use tap2go-kuucn

# Clear cache and retry
firebase functions:delete paymongoWebhook
firebase deploy --only functions
```

### PayMongo Webhook Not Receiving
```bash
# Check function logs
firebase functions:log --only paymongoWebhook

# Verify webhook URL
curl -X POST https://us-central1-tap2go-kuucn.cloudfunctions.net/paymongoWebhook

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

- **Firebase Support**: https://firebase.google.com/support
- **PayMongo Support**: https://developers.paymongo.com
- **Google Maps Support**: https://developers.google.com/maps/support
- **Cloudinary Support**: https://cloudinary.com/support

## 🔄 Update Procedures

### Adding New Environment Variables
1. Add to `.env.local`
2. Add to `.env.example` (without values)
3. Update this documentation
4. Update deployment scripts if needed
5. Restart development server

### Rotating API Keys
1. Generate new keys in respective services
2. Update environment variables
3. Test functionality
4. Deploy changes
5. Revoke old keys

---

**Last Updated**: June 2025  
**Version**: 1.0  
**Maintainer**: John Lloyd Callao (johnlloydcallao@gmail.com)
