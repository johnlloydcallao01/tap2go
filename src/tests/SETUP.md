# 🚀 Testing Infrastructure Setup Guide

This guide will help you set up and use the organized testing infrastructure for Tap2Go.

## 📋 Prerequisites

### Required Environment Variables

Add these to your `.env.local` file:

```env
# Enable testing in development
ENABLE_TEST_ROUTES=true
NODE_ENV=development

# Database (Required for most tests)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Firebase (Required for customer/business tests)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Email Testing (Optional)
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_RESEND_FROM_EMAIL=onboarding@resend.dev

# AI Testing (Optional)
GOOGLE_AI_API_KEY=your_google_ai_key

# FCM Testing (Optional)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

## 🎯 Quick Start

### 1. Enable Test Routes
```bash
npm run test:enable
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Test Dashboard
```
http://localhost:3000/tests/dashboard
```

## 📊 Test Categories

### 🔐 Authentication Tests (CRITICAL)
**Location**: `/tests/pages/auth/`
**Priority**: HIGH - Never disable

- **test-auth**: Complete authentication flow testing
- **test-auth-flow**: Authentication integration testing
- **test-admin-login**: Admin panel authentication

**Quick Access**:
```bash
npm run test:auth
# Opens: http://localhost:3000/tests/pages/auth/test-auth
```

### 📱 Notification Tests (CRITICAL)
**Location**: `/tests/pages/notifications/`
**Priority**: HIGH - Never disable

- **test-all-notifications**: Complete FCM notification testing
- **test-notifications**: Basic notification functionality

**Quick Access**:
```bash
npm run test:notifications
# Opens: http://localhost:3000/tests/pages/notifications/test-all-notifications
```

### 🏪 Business Logic Tests (CRITICAL)
**Location**: `/tests/pages/business/`
**Priority**: HIGH - Never disable

- **test-customer**: Customer management and data structure
- **test-restaurant**: Restaurant operations
- **test-vendor**: Vendor panel functionality
- **test-complete-flow**: End-to-end order processing

**Quick Access**:
```bash
npm run test:business
# Opens: http://localhost:3000/tests/pages/business/test-customer
```

### 🔗 Integration Tests (MEDIUM)
**Location**: `/tests/pages/integrations/`
**Priority**: MEDIUM - Can be disabled for basic functionality

- **test-webhook**: Webhook integrations
- **test-chat**: AI chatbot functionality

### 🛠️ Utility Tests (LOW)
**Location**: `/tests/pages/utilities/`
**Priority**: LOW - Development convenience only

- **test-simple**: Basic functionality testing
- **test-admin**: Admin tools testing

## 🔧 Environment Control

### Enable Tests (Development Only)
```bash
npm run test:enable
```

### Disable Tests
```bash
npm run test:disable
```

### Check Test Status
Tests are automatically disabled in production. In development, check:
```bash
echo $ENABLE_TEST_ROUTES
# Should output: true
```

## 🚨 Production Safety

### Automatic Protection
- Tests are **automatically hidden** in production builds
- Middleware redirects test routes to home page when disabled
- No manual intervention required for deployment

### Manual Verification
```bash
# In production environment
curl https://your-domain.com/tests/dashboard
# Should redirect to: https://your-domain.com/
```

## 📝 Testing Workflows

### Daily Development Testing
1. **Authentication**: Test login/logout flows
2. **Notifications**: Verify FCM push notifications
3. **Business Logic**: Test customer/order operations

### Pre-deployment Testing
1. **Run all critical tests**: Authentication, Notifications, Business Logic
2. **Verify API endpoints**: Check backend functionality
3. **Test integrations**: Ensure third-party services work

### Production Monitoring
1. **API Health Checks**: Use `/api/admin/test` endpoint
2. **Database Connectivity**: Monitor Supabase/Firebase connections
3. **Email Service**: Test email delivery functionality

## 🔍 Troubleshooting

### Tests Not Loading
1. Check `ENABLE_TEST_ROUTES=true` in `.env.local`
2. Verify `NODE_ENV=development`
3. Restart development server: `npm run dev`

### Authentication Tests Failing
1. Verify Firebase configuration
2. Check admin user credentials
3. Ensure proper role assignments

### Notification Tests Not Working
1. Allow browser notifications
2. Check FCM configuration
3. Verify Firebase Admin credentials

### Database Tests Failing
1. Check Supabase connection
2. Verify environment variables
3. Run: `npm run supabase:test`

### Email Tests Not Sending
1. Verify Resend API key
2. Check email configuration
3. Run: `npm run email:dev-test your-email@example.com`

## 📚 Additional Resources

### NPM Scripts Reference
```bash
# Test Dashboard
npm run test:dashboard

# Category-specific tests
npm run test:auth
npm run test:notifications  
npm run test:business
npm run test:all

# Backend script tests
npm run supabase:test
npm run email:dev-test
npm run ai:test
npm run chatbot:test

# Environment control
npm run test:enable
npm run test:disable
```

### File Structure
```
src/tests/
├── README.md              # Main documentation
├── SETUP.md              # This setup guide
├── page.tsx              # Test index page
├── dashboard/            # Test dashboard
├── pages/                # UI test pages
│   ├── auth/            # Authentication tests
│   ├── notifications/   # Notification tests
│   ├── business/        # Business logic tests
│   ├── integrations/    # Integration tests
│   └── utilities/       # Utility tests
└── scripts/             # Backend test scripts
```

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Test routes enabled (`ENABLE_TEST_ROUTES=true`)
- [ ] Development server running
- [ ] Test dashboard accessible
- [ ] Authentication tests passing
- [ ] Notification tests working
- [ ] Business logic tests functional
- [ ] Production safety verified

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**: Browser console and terminal output
2. **Verify environment**: Ensure all required variables are set
3. **Test connectivity**: Run individual connection tests
4. **Review documentation**: Check test-specific README files
5. **Reset environment**: Restart server and clear cache

Remember: **Never disable critical tests** (Authentication, Notifications, Business Logic) as they ensure core functionality works correctly.
