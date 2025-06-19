# 🧪 Tap2Go Testing Infrastructure

This directory contains all testing utilities, pages, and scripts for the Tap2Go application.

## 📁 Directory Structure

```
src/tests/
├── README.md                    # This file
├── dashboard/                   # Test navigation dashboard
│   └── page.tsx                # Main test dashboard
├── pages/                       # Test pages (UI testing)
│   ├── auth/                   # Authentication testing
│   │   ├── test-auth/
│   │   ├── test-auth-flow/
│   │   └── test-admin-login/
│   ├── notifications/          # Notification testing
│   │   ├── test-notifications/
│   │   ├── test-all-notifications/
│   │   └── test-fcm/
│   ├── business/               # Business logic testing
│   │   ├── test-customer/
│   │   ├── test-restaurant/
│   │   ├── test-vendor/
│   │   └── test-complete-flow/
│   ├── integrations/           # Third-party integrations
│   │   ├── test-webhook/
│   │   ├── test-email/
│   │   └── test-chat/
│   └── utilities/              # General utilities
│       ├── test-simple/
│       └── test-admin/
├── api/                        # API test endpoints
│   ├── auth/
│   ├── notifications/
│   ├── email/
│   └── database/
└── scripts/                    # Backend test scripts
    ├── auth/
    ├── database/
    ├── email/
    ├── ai/
    └── integrations/
```

## 🎯 Test Categories

### 🔐 Authentication Tests
- **Purpose**: Verify user authentication, authorization, and session management
- **Critical**: YES - Core security functionality
- **Location**: `pages/auth/`

### 📱 Notification Tests  
- **Purpose**: Test FCM push notifications, email notifications, and real-time updates
- **Critical**: YES - Customer experience depends on notifications
- **Location**: `pages/notifications/`

### 🏪 Business Logic Tests
- **Purpose**: Test customer management, restaurant operations, order flows
- **Critical**: YES - Core business functionality
- **Location**: `pages/business/`

### 🔗 Integration Tests
- **Purpose**: Test third-party services (webhooks, email, AI chatbot)
- **Critical**: MEDIUM - Important for full functionality
- **Location**: `pages/integrations/`

### 🛠️ Utility Tests
- **Purpose**: General testing utilities and admin tools
- **Critical**: LOW - Development convenience
- **Location**: `pages/utilities/`

## 🚀 Quick Start

### Access Test Dashboard
```
http://localhost:3000/tests/dashboard
```

### Run Specific Test Categories
```bash
# Authentication tests
npm run test:auth

# Notification tests  
npm run test:notifications

# Business logic tests
npm run test:business

# All tests
npm run test:all
```

## 🔧 Environment Control

Tests are only available in development mode. Set in `.env.local`:
```env
ENABLE_TEST_ROUTES=true
NODE_ENV=development
```

## ⚠️ Important Notes

1. **Never delete authentication tests** - Critical for security
2. **Never delete notification tests** - Critical for customer experience  
3. **Never delete business logic tests** - Critical for core functionality
4. **Utility tests can be disabled in production** - Development convenience only

## 📊 Test Coverage

- ✅ Authentication & Authorization
- ✅ Push Notifications (FCM)
- ✅ Email Services (Resend)
- ✅ Database Operations (Supabase/Firebase)
- ✅ Payment Integration (PayMongo)
- ✅ AI/Chatbot (Google AI)
- ✅ Media Management (Cloudinary)
- ✅ API Endpoints
- ✅ Business Workflows
- ✅ Production Environment Validation

## 🎨 Test Dashboard Features

- 📊 **Test Status Overview** - See all test results at a glance
- 🎯 **Category Navigation** - Jump to specific test types
- 📱 **Mobile Responsive** - Test on all devices
- 🔄 **Real-time Results** - Live test execution feedback
- 📋 **Test Documentation** - Inline help and instructions
