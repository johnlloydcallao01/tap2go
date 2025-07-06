# React Native Bundling Issue Fix

## Problem
The React Native app was failing to bundle with the error:
```
Android Bundling failed 1364ms node_modules\expo\AppEntry.js (1 module)
Unable to resolve "../../App" from "node_modules\expo\AppEntry.js"
```

## Root Causes Identified

### 1. Missing Main Entry Point in app.json
The `app.json` file was missing the `main` entry point specification, causing Expo to use its default entry point resolution which was looking for "../../App" relative to the expo module location.

### 2. Incorrect Working Directory
The expo command was being run from the monorepo root (`C:\Users\ACER\Desktop\tap2go`) instead of the mobile app directory (`C:\Users\ACER\Desktop\tap2go\apps\mobile-customer`).

### 3. iOS Deployment Target Too Low
The iOS deployment target was set to "13.4" but Expo requires at least "15.1".

## Fixes Applied

### 1. Added Main Entry Point to app.json
```json
{
  "expo": {
    "name": "Tap2Go Customer",
    "slug": "tap2go-customer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "main": "index.ts",  // ← Added this line
    // ... rest of config
  }
}
```

### 2. Updated iOS Deployment Target
```json
{
  "expo": {
    // ... other config
    "plugins": [
      "expo-system-ui",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          },
          "ios": {
            "deploymentTarget": "15.1"  // ← Updated from "13.4"
          }
        }
      ]
    ]
  }
}
```

## How the Entry Point Resolution Works

1. **index.ts** (main entry point) → imports from `./App`
2. **App.tsx** → contains the main App component
3. **registerRootComponent(App)** → registers the App component with React Native

The correct flow:
```
app.json (main: "index.ts") 
  ↓
index.ts (import App from './App') 
  ↓
App.tsx (export default function App)
```

## Correct Usage

### Running the App
Always run Expo commands from the mobile app directory:
```bash
# Correct
cd apps/mobile-customer
npx expo start

# Incorrect (causes bundling errors)
cd . # (root directory)
npx expo start
```

### Development Commands
```bash
# From apps/mobile-customer directory:
npx expo start              # Start development server
npx expo start --clear      # Start with cleared cache
npx expo start --android    # Start and open Android
npx expo start --ios        # Start and open iOS
npx expo start --web        # Start and open web
```

## Project Structure Verification
The mobile app should have this structure:
```
apps/mobile-customer/
├── app.json              # Expo configuration with main entry
├── index.ts              # Main entry point
├── App.tsx               # Root App component
├── package.json          # Package configuration
├── metro.config.js       # Metro bundler configuration
└── src/                  # Source code
    ├── components/
    ├── screens/
    ├── navigation/
    └── contexts/
```

## Testing the Fix
1. **Navigate to the correct directory:**
   ```bash
   cd apps/mobile-customer
   ```

2. **Start the development server:**
   ```bash
   npx expo start --clear
   ```

3. **Verify successful startup:**
   - Metro bundler should start without errors
   - QR code should appear for Expo Go or development build
   - No "Unable to resolve" errors should occur

## Additional Notes
- The app now uses port 8082 if 8081 is occupied
- Fast resolver is enabled for better performance
- The bundling cache is rebuilt on first run after the fix
- Both Expo Go and development build modes are supported

## Files Modified
- `apps/mobile-customer/app.json` - Added main entry point and updated iOS deployment target

## Prevention
To prevent this issue in the future:
1. Always include `"main": "index.ts"` in app.json when creating Expo configurations
2. Run Expo commands from the correct app directory
3. Ensure iOS deployment target meets minimum requirements (15.1+)
4. Verify the entry point chain: app.json → index.ts → App.tsx

The bundling issue is now completely resolved and the app should start successfully.
