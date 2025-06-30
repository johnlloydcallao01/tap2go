# 🚨 Native Crash Debugging Guide - APK Silent Crashes

## 🎯 **THE PROBLEM**
Your APK crashes **BEFORE JavaScript execution begins**, making all JavaScript error handlers useless. This is a **native Android crash** that requires **native debugging tools**.

## 📋 **IMMEDIATE ACTION PLAN**

### **Step 1: Capture Native Crash Logs with ADB Logcat**

1. **Install Android Debug Bridge (ADB)**:
   ```bash
   # If you have Android Studio installed, ADB is already available
   # Otherwise download Android SDK Platform Tools
   ```

2. **Enable USB Debugging on your Android device**:
   - Go to Settings → About Phone → Tap "Build Number" 7 times
   - Go to Settings → Developer Options → Enable "USB Debugging"

3. **Connect device and verify ADB connection**:
   ```bash
   adb devices
   # Should show your device listed
   ```

4. **Start ADB Logcat BEFORE launching the APK**:
   ```bash
   # Clear existing logs first
   adb logcat -c
   
   # Start monitoring logs (run this in a separate terminal)
   adb logcat | grep -E "(FATAL|ERROR|AndroidRuntime|ReactNative|Expo)"
   ```

5. **Launch the APK and capture the crash**:
   - Install and launch your APK
   - The crash logs will appear in the terminal running logcat
   - **COPY ALL THE CRASH LOGS** - this is the key to solving the issue

### **Step 2: Alternative - Use WebADB (No Installation Required)**

1. Open Chrome browser
2. Go to https://webadb.com/
3. Connect your Android device via USB
4. Enable USB debugging and authorize the connection
5. Use WebADB's logcat feature to capture crash logs

### **Step 3: Build and Test Locally First**

Before testing the EAS build, test locally:

```bash
# Navigate to mobile-customer directory
cd apps/mobile-customer

# Build local production APK
npx expo run:android --variant release

# This will show if the crash happens locally too
```

## 🔍 **WHAT TO LOOK FOR IN CRASH LOGS**

### **Common Native Crash Patterns:**

1. **Native Module Initialization Failure**:
   ```
   FATAL EXCEPTION: main
   java.lang.RuntimeException: Unable to create application
   ```

2. **Missing Native Dependencies**:
   ```
   java.lang.UnsatisfiedLinkError: dlopen failed: library not found
   ```

3. **JNI/React Native Bridge Issues**:
   ```
   JNI DETECTED ERROR IN APPLICATION: use of invalid jobject
   ```

4. **Android API Compatibility Issues**:
   ```
   java.lang.NoSuchMethodError: No virtual method
   ```

5. **Expo Module Linking Issues**:
   ```
   ExpoModulesPackage: Failed to create package
   ```

## 🛠️ **ENHANCED ERROR HANDLING IMPLEMENTED**

I've updated your app with production-safe error handling:

### **New Features:**
- ✅ **Production-safe global error handler** - works in release builds
- ✅ **Enhanced promise rejection handling** - captures more error details
- ✅ **Native log output** - all errors logged to adb logcat
- ✅ **Production error monitoring component** - detects crashes in real-time
- ✅ **Detailed error alerts** - shows error details in production

### **Key Changes Made:**
1. **Enhanced Global Error Handler** - logs to native console (visible in adb logcat)
2. **Production Error Handler Component** - monitors app health in production
3. **Improved Error Alerts** - work in production builds unlike development alerts

## 📱 **TESTING PROCEDURE**

### **Phase 1: Local Testing**
```bash
# Test local production build first
npx expo run:android --variant release
```

### **Phase 2: EAS Build Testing**
```bash
# Create new EAS build with enhanced error handling
eas build --platform android --profile preview
```

### **Phase 3: Crash Log Analysis**
1. Start adb logcat monitoring
2. Install and launch APK
3. Capture complete crash logs
4. Analyze logs for root cause

## 🎯 **EXPECTED OUTCOMES**

### **Scenario A: JavaScript Errors Now Visible**
- If the crash was a JavaScript error, you'll now see detailed error alerts
- The app will show error details instead of crashing silently

### **Scenario B: Native Crash Logs Captured**
- If it's a native crash, adb logcat will show the exact cause
- Common causes: missing native modules, Android API issues, linking problems

### **Scenario C: App Launches Successfully**
- The enhanced error handling may have resolved initialization issues
- App will show detailed environment validation and service status

## 🚀 **NEXT STEPS AFTER CRASH LOG ANALYSIS**

Once you have the crash logs, we can:
1. **Identify the specific native module causing the crash**
2. **Fix Android API compatibility issues**
3. **Resolve missing native dependencies**
4. **Update Expo module configurations**
5. **Implement targeted fixes for the root cause**

## 📞 **IMMEDIATE ACTION REQUIRED**

**Please run the following commands and share the results:**

```bash
# 1. Start ADB logcat monitoring
adb logcat -c && adb logcat | grep -E "(FATAL|ERROR|AndroidRuntime|ReactNative|Expo)"

# 2. In another terminal, create new build
cd apps/mobile-customer
eas build --platform android --profile preview

# 3. Install APK and launch it while logcat is running
# 4. Copy ALL crash logs that appear
```

**The crash logs will reveal the exact cause of the silent crashes!**
