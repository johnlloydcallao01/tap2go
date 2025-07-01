# 🔧 Expo Environment Variables Production Build Fix

## 📋 Problem Summary

**Issue**: Environment variables work perfectly in Expo Go development but return `undefined` in production APK builds, causing "App Initialization Failed" errors.

**Symptoms**:
- ✅ Local development with `npx expo start` works perfectly
- ✅ Expo Go testing works perfectly  
- ❌ Production APK shows "Environment Validation Errors"
- ❌ All `EXPO_PUBLIC_*` variables return `undefined` at runtime

## 🔍 Root Cause Analysis

### The Problem
In React Native production builds, environment variables are handled differently than in development:

1. **Build Time**: EAS correctly loads all `EXPO_PUBLIC_*` variables from `eas.json`
2. **Bundle Time**: Metro bundler should inline these variables into the JavaScript bundle
3. **Runtime**: `process.env` access patterns can fail in production builds

### Why Standard `process.env` Access Fails
```typescript
// ❌ This pattern can fail in production builds
const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
```

**Reason**: In production builds, Metro bundler's environment variable inlining can be inconsistent when accessing `process.env` dynamically or through helper functions.

## ✅ The Solution

### 1. Direct Environment Variable References
Create a static object with direct `process.env` references that Metro bundler can reliably inline:

```typescript
// ✅ Direct references for production build compatibility
const ENV_VARS = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_MAPS_FRONTEND_KEY: process.env.EXPO_PUBLIC_MAPS_FRONTEND_KEY,
  // ... all other critical variables
} as const;
```

### 2. Dual-Access Pattern
Implement a helper function that tries multiple access methods:

```typescript
const getEnvVar = (key: string): string => {
  try {
    // First: Try pre-defined ENV_VARS object (production builds)
    if (key in ENV_VARS) {
      const value = ENV_VARS[key as keyof typeof ENV_VARS];
      if (value) return value;
    }

    // Fallback: Try process.env (development)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
    
    return '';
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return '';
  }
};
```

## 📁 Configuration Files Structure

### 1. EAS Build Configuration (`eas.json`)
```json
{
  "build": {
    "preview": {
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "your-api-key",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "your-project-id",
        // ... all environment variables
      }
    }
  }
}
```

### 2. Local Development (`.env.local`)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... all environment variables
```

### 3. Environment Access (`src/config/environment.ts`)
- Direct ENV_VARS object for production builds
- Dual-access pattern with fallbacks
- Comprehensive debugging for troubleshooting

## 🚀 Implementation Steps

### Step 1: Update Environment Configuration
```typescript
// In src/config/environment.ts
const ENV_VARS = {
  // Add ALL critical EXPO_PUBLIC_ variables here
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  // ... etc
} as const;
```

### Step 2: Update Helper Function
```typescript
const getEnvVar = (key: string): string => {
  // Try ENV_VARS first, then process.env
  if (key in ENV_VARS) {
    const value = ENV_VARS[key as keyof typeof ENV_VARS];
    if (value) return value;
  }
  
  return process.env[key] || '';
};
```

### Step 3: Add Debugging
```typescript
export const debugEnvironmentVariables = () => {
  console.log('ENV_VARS object status:');
  Object.entries(ENV_VARS).forEach(([key, value]) => {
    console.log(`${key}: ${value ? 'SET' : 'EMPTY'}`);
  });
};
```

## 🔬 Why This Solution Works

### 1. **Static Analysis Friendly**
Metro bundler can analyze and inline direct `process.env.EXPO_PUBLIC_*` references at build time.

### 2. **Production Build Compatible**
The ENV_VARS object ensures variables are accessible even when `process.env` dynamic access fails.

### 3. **Development Compatible**
Fallback to `process.env` ensures local development continues to work.

### 4. **Debugging Enabled**
Comprehensive logging helps identify issues in future builds.

## 🛡️ Prevention Guidelines

### ✅ Do This
- Always use direct `process.env.EXPO_PUBLIC_*` references in the ENV_VARS object
- Test production builds, not just Expo Go
- Use the dual-access pattern for environment variable access
- Include comprehensive debugging in environment configuration

### ❌ Avoid This
- Dynamic `process.env` access in production builds
- Relying only on Expo Go testing for environment variables
- Missing variables from the ENV_VARS object
- Assuming development behavior matches production

## 🧪 Testing Checklist

### Before Production Release
- [ ] Local development works (`npx expo start`)
- [ ] Expo Go testing works
- [ ] EAS preview build works (`eas build --platform android --profile preview`)
- [ ] Production APK environment variables are accessible
- [ ] Environment validation passes in production build
- [ ] Debug logs show correct variable access method

### Debugging Commands
```bash
# Test local development
npx expo start

# Create preview build
eas build --platform android --profile preview

# Check build logs for environment variable loading
# Download APK and check console logs for debugging output
```

## 📚 References

- [Expo Environment Variables Documentation](https://docs.expo.dev/guides/environment-variables/)
- [EAS Environment Variables Documentation](https://docs.expo.dev/eas/environment-variables/)
- [Metro Bundler Environment Variable Inlining](https://metrobundler.dev/)

## 🔧 Complete Code Implementation

### Environment Configuration File
```typescript
// apps/mobile-customer/src/config/environment.ts

// Direct environment variable references for production builds
const ENV_VARS = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_VAPID_KEY: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_MAPS_FRONTEND_KEY: process.env.EXPO_PUBLIC_MAPS_FRONTEND_KEY,
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE: process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE,
} as const;

const getEnvVar = (key: string): string => {
  try {
    // First: Try ENV_VARS object (production builds)
    if (key in ENV_VARS) {
      const value = ENV_VARS[key as keyof typeof ENV_VARS];
      if (value) return value;
    }

    // Fallback: Try process.env (development)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }

    return '';
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return '';
  }
};

export const debugEnvironmentVariables = () => {
  console.log('🔧 === ENVIRONMENT DEBUGGING ===');
  console.log('🔧 ENV_VARS object status:');
  Object.entries(ENV_VARS).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? `✅ SET (${value.substring(0, 20)}...)` : '❌ EMPTY'}`);
  });
  console.log('🔧 === END ENVIRONMENT DEBUGGING ===');
};
```

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Missing Variables in ENV_VARS Object
**Problem**: Adding new environment variables to `eas.json` and `.env.local` but forgetting to add them to the `ENV_VARS` object in `environment.ts`.

**Symptoms**: Variables show as "NOT_FOUND" in ENV_VARS debugging logs, even though they exist in `eas.json`.

**Solution**: Always update all three places:
```typescript
// 1. Add to eas.json
"EXPO_PUBLIC_NEW_VARIABLE": "value"

// 2. Add to .env.local
EXPO_PUBLIC_NEW_VARIABLE=value

// 3. Add to ENV_VARS object in environment.ts
const ENV_VARS = {
  // ... existing variables
  EXPO_PUBLIC_NEW_VARIABLE: process.env.EXPO_PUBLIC_NEW_VARIABLE,
} as const;
```

**Real Example**: The original issue was caused by missing variables in ENV_VARS:
- `EXPO_PUBLIC_FIREBASE_VAPID_KEY` - existed in eas.json but missing from ENV_VARS
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` - existed in eas.json but missing from ENV_VARS
- `EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE` - existed in eas.json but missing from ENV_VARS
- And several others...

### Pitfall 2: Dynamic Environment Variable Access
**Problem**: Using computed property names or dynamic access patterns.

```typescript
// ❌ This won't work in production builds
const prefix = 'EXPO_PUBLIC_';
const key = `${prefix}FIREBASE_API_KEY`;
const value = process.env[key];

// ✅ Use static references instead
const value = ENV_VARS.EXPO_PUBLIC_FIREBASE_API_KEY;
```

### Pitfall 3: Assuming Expo Go Behavior Matches Production
**Problem**: Only testing with Expo Go and assuming production builds work the same way.

**Solution**: Always test with actual EAS builds:
```bash
# Create preview build for testing
eas build --platform android --profile preview

# Download and test APK on device
# Check console logs for environment variable debugging
```

## 🔍 Troubleshooting Guide

### Issue: Variables Still Undefined in Production
1. **Check ENV_VARS object**: Ensure ALL variables are listed in the ENV_VARS object
2. **Verify eas.json**: Confirm variables are in build profile
3. **Check .env.local**: Ensure EXPO_PUBLIC_ prefixed versions exist
4. **Check build logs**: Look for environment variable loading messages
5. **Add debugging**: Use `debugEnvironmentVariables()` function
6. **Test incrementally**: Add one variable at a time to isolate issues

**Critical Check**: Compare the `env: export` line in terminal output with your ENV_VARS object. Missing variables in the export line indicate they're not in .env.local with EXPO_PUBLIC_ prefix.

### Issue: Variables Work in Development but Not Production
1. **Check Metro bundler**: Ensure it's inlining variables correctly
2. **Verify static references**: Use direct `process.env.EXPO_PUBLIC_*` syntax
3. **Check build configuration**: Ensure production build profile is correct
4. **Test with preview build**: Use preview profile before production

### Issue: Build Logs Show Variables but Runtime Doesn't
1. **This is the exact issue this fix solves**
2. **Implement ENV_VARS object**: Provides static references for Metro bundler
3. **Use dual-access pattern**: Fallback ensures compatibility
4. **Add comprehensive debugging**: Identify which access method works

## 🎯 Key Takeaway

**The fundamental issue**: Metro bundler's environment variable inlining works differently in production builds compared to development. The solution is to provide static, analyzable references that Metro can reliably inline at build time.

**The fix**: Create an ENV_VARS object with direct `process.env` references and use a dual-access pattern that tries this object first, then falls back to dynamic `process.env` access for development compatibility.

## 🔍 Debugging Checklist

When environment variables are missing, follow this systematic debugging approach:

### 1. Check Terminal Output
Look for the `env: export` line when starting Expo:
```bash
env: export EXPO_PUBLIC_FIREBASE_API_KEY EXPO_PUBLIC_FIREBASE_PROJECT_ID ...
```
**Missing variables here = not in .env.local with EXPO_PUBLIC_ prefix**

### 2. Check ENV_VARS Object
Run the app and look for debugging logs:
```
ENV_VARS[EXPO_PUBLIC_FIREBASE_VAPID_KEY]: NOT_FOUND
```
**NOT_FOUND = missing from ENV_VARS object in environment.ts**

### 3. Check Configuration Files
Ensure variables exist in all three places:
- ✅ `apps/mobile-customer/eas.json` (preview build profile)
- ✅ `apps/mobile-customer/.env.local` (with EXPO_PUBLIC_ prefix)
- ✅ `apps/mobile-customer/src/config/environment.ts` (in ENV_VARS object)

### 4. Verify Variable Names
Common naming issues:
- ❌ `FIREBASE_ADMIN_CLIENT_EMAIL` (missing EXPO_PUBLIC_ prefix)
- ✅ `EXPO_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL` (correct)
- ❌ `EXPO_PUBLIC_MAPS_BACKEND_KEY` in eas.json but `MAPS_BACKEND_KEY` in code
- ✅ Consistent naming across all files

### 5. Test Environment Loading
```bash
# Restart Expo and check logs
npx expo start --go

# Look for these patterns in logs:
🔧 getEnvVar(EXPO_PUBLIC_FIREBASE_VAPID_KEY): ✅ Found via ENV_VARS
🔧 getEnvVar(EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME): ❌ Empty/Missing
```

## 📋 Complete Variable Checklist

Ensure these variables are in ALL THREE locations:

### Firebase Variables
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_VAPID_KEY` ⚠️ Often missed
- `EXPO_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL` ⚠️ Often missed

### Supabase Variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` ⚠️ Often missed
- `EXPO_PUBLIC_ENABLE_SUPABASE_CMS` ⚠️ Often missed

### Maps Variables
- `EXPO_PUBLIC_MAPS_FRONTEND_KEY`
- `EXPO_PUBLIC_MAPS_BACKEND_KEY` ⚠️ Often missed

### Other Service Variables
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` ⚠️ Often missed
- `EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE` ⚠️ Often missed
- `EXPO_PUBLIC_GOOGLE_AI_API_KEY`
- `EXPO_PUBLIC_ENABLE_AI_FEATURES`

⚠️ = Variables that were missing in the original issue and commonly forgotten

## 🚨 Critical Security Fix: Firebase Admin SDK Removal

**Issue**: The mobile app was incorrectly configured to use Firebase Admin SDK, which is a **server-side only** SDK that should never be used in client applications.

**Security Risks**:
- Exposed Firebase Admin private key to client applications
- Potential unauthorized access to Firebase Admin functions
- Violation of Firebase security best practices

**Resolution**:
- ✅ Removed `firebaseAdminConfig` from mobile app environment configuration
- ✅ Removed Firebase Admin variables from ENV_VARS object
- ✅ Added clear documentation that Firebase Admin SDK is server-side only
- ✅ Mobile app now only uses Firebase Client SDK (secure and appropriate)

**Important**: Firebase Admin functionality should only be accessed through server-side API calls to the web application.

## 🔧 Final Resolution Summary

**Root Cause**: Environment variables were not being properly inlined by Metro bundler during production builds due to dynamic access patterns.

**Solution**: Implemented dual-access pattern with ENV_VARS object containing direct `process.env` references that Metro bundler can reliably inline at build time.

**Key Changes**:
1. ✅ Created ENV_VARS object with direct environment variable references
2. ✅ Updated getEnvVar function to prioritize ENV_VARS for production builds
3. ✅ Added comprehensive debugging and validation
4. ✅ Updated all missing variables in ENV_VARS object
5. ✅ Enhanced troubleshooting documentation
6. ✅ **SECURITY FIX**: Removed Firebase Admin SDK from mobile app (server-side only)

**Status**: ✅ **RESOLVED** - All environment variables now load correctly in both development and production builds.
