# EAS Build Troubleshooting Guide - tap2go Mobile Apps

## Overview
This document chronicles our systematic approach to resolving EAS build issues for React Native apps in a PNPM monorepo environment, specifically for the tap2go-mobile-customer project using Expo SDK 53.

## Build Environment Context
- **Monorepo**: PNPM workspace with multiple apps
- **Target App**: `apps/mobile-customer` 
- **Expo SDK**: 53.0.13
- **React Native**: 0.79
- **Build Profile**: Development with `expo-dev-client`
- **Platform**: Android
- **EAS Account**: `tap2go9n`

## Timeline of Issues and Solutions

### Phase 1: Bundle JavaScript Module Resolution (SOLVED ✅)

#### **Problem**: Persistent `color-convert` Module Resolution Error
- **Error**: `Unable to resolve module color-convert from node_modules/color-string/index.js`
- **Build Progress**: Failed at 98.8% - 99.8% during Bundle JavaScript phase
- **Root Cause**: PNPM's isolated dependency structure prevented Metro from finding hoisted modules

#### **Solution**: PNPM Hoisting Configuration
**File**: `package.json` (root level)
```json
{
  "pnpm": {
    "publicHoistPattern": [
      "*expo*", 
      "*react-native*", 
      "*@babel*", 
      "*metro*", 
      "*expo-modules-core*", 
      "scheduler", 
      "color-string", 
      "color", 
      "color-convert", 
      "@babel/runtime"
    ]
  }
}
```

**Key Insight**: Adding `"color"` and `"color-convert"` to `publicHoistPattern` resolved the module resolution issue by ensuring these packages were available at the root level for Metro's resolver.

### Phase 2: Android Compilation - ExpoModulesPackage Import (SOLVED ✅)

#### **Problem**: ExpoModulesPackage Class Not Found
- **Error**: `error: cannot find symbol import expo.core.ExpoModulesPackage;`
- **Context**: Occurred after Bundle JavaScript phase completed successfully
- **Root Cause**: Expo SDK 53 moved ExpoModulesPackage from `expo.core` to `expo.modules`

#### **Solution**: Package Structure Update
The issue was resolved through a combination of configuration changes:
1. Updated `expo-modules-core` to latest version (2.4.0)
2. Disabled New Architecture: `"newArchEnabled": false` in `app.json`
3. Updated autolinking configurations

### Phase 3: React Native CLI Autolinking (SOLVED ✅)

#### **Problem**: Missing React Native CLI Configuration
- **Error**: `RNGP - Autolinking: Could not find project.android.packageName in react-native config output!`
- **Context**: Occurred during `:app:generateAutolinkingPackageList` Gradle task
- **Root Cause**: `@react-native-community/cli` was not installed, causing autolinking to fail

#### **Solution**: Install React Native CLI + Configuration
1. **Install CLI**: `pnpm add -D @react-native-community/cli`
2. **Create Configuration Files**:

**File**: `apps/mobile-customer/react-native.config.js`
```javascript
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.tap2go.mobile',
    },
  },
};
```

**File**: `react-native.config.js` (root level)
```javascript
module.exports = {
  project: {
    android: {
      sourceDir: './apps/mobile-customer/android',
      appName: 'app',
      packageName: 'com.tap2go.mobile',
    },
  },
};
```

## Final Working Configuration

### EAS Configuration
**File**: `apps/mobile-customer/eas.json`
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NODE_ENV": "development",
        "EXPO_USE_METRO_WORKSPACE_ROOT": "1",
        "EAS_SKIP_AUTO_FINGERPRINT": "1",
        "EXPO_USE_COMMUNITY_AUTOLINKING": "1"
      }
    }
  }
}
```

### App Configuration
**File**: `apps/mobile-customer/app.json`
```json
{
  "expo": {
    "owner": "tap2go9n",
    "newArchEnabled": false,
    "android": {
      "package": "com.tap2go.mobile"
    }
  }
}
```

### Package Configuration
**File**: `apps/mobile-customer/package.json`
```json
{
  "devDependencies": {
    "@react-native-community/cli": "^18.0.0"
  },
  "expo": {
    "autolinking": {
      "android": {
        "packageName": "com.tap2go.mobile"
      }
    }
  }
}
```

## Build Success Metrics
- **Final Build Status**: ✅ SUCCESSFUL
- **Build Time**: ~14 minutes
- **Bundle JavaScript**: ✅ Completed (previously failed at 98.8-99.8%)
- **Android Compilation**: ✅ Completed
- **APK Generation**: ✅ Available for download

## Replication Guide for Future Mobile Apps

### For `mobile-vendor` or `mobile-driver`:

1. **Copy Configuration Files** from `mobile-customer`:
   - `eas.json` (update project name)
   - `app.json` (update package name to `com.tap2go.vendor` or `com.tap2go.driver`)
   - `react-native.config.js` (update package name)

2. **Install Required Dependencies**:
   ```bash
   pnpm add -D @react-native-community/cli
   ```

3. **Update Android Configuration**:
   - `android/app/build.gradle`: Set correct `namespace` and `applicationId`

4. **Root Configuration** (already done):
   - PNPM hoisting patterns in root `package.json`
   - Root-level `react-native.config.js` (update paths per app)

## Key Lessons Learned

### 1. **PNPM Monorepo Challenges**
- PNPM's isolated dependencies require explicit hoisting for Metro resolution
- `publicHoistPattern` is crucial for React Native module resolution

### 2. **Expo SDK 53 Changes**
- New Architecture is enabled by default (may cause compatibility issues)
- Package structure changes require updated import paths

### 3. **Community vs Expo Autolinking**
- `EXPO_USE_COMMUNITY_AUTOLINKING=1` requires React Native CLI installation
- React Native CLI must be able to find project configuration

### 4. **Systematic Troubleshooting**
- Address issues in build phase order: Bundle JS → Android Compilation → APK Generation
- Each phase has different root causes and solutions

## Prevention Checklist

Before creating EAS builds for new mobile apps:

- [ ] ✅ Root `publicHoistPattern` includes all necessary packages
- [ ] ✅ `@react-native-community/cli` installed as devDependency
- [ ] ✅ `react-native.config.js` configured with correct package name
- [ ] ✅ `app.json` has correct owner and Android package configuration
- [ ] ✅ `eas.json` includes all required environment variables
- [ ] ✅ Android `build.gradle` has matching package name
- [ ] ✅ Test `npx react-native config` locally before EAS build

## Quick Reference Commands

```bash
# Test React Native CLI configuration
npx react-native config

# Create EAS build
npx eas build --platform android --profile development

# List recent builds
npx eas build:list --platform android --limit 5

# Download specific build
npx eas build:download --id [BUILD_ID]
```

---

**Last Updated**: June 29, 2025  
**Status**: All issues resolved, builds working consistently  
**Next Steps**: Use this configuration as template for mobile-vendor and mobile-driver apps
