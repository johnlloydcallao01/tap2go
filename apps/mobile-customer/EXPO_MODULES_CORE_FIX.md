# Expo Modules Core Resolution Fix for PNPM Monorepo

## Problem
EAS Build was failing with the error:
```
Error: Unable to resolve module expo-modules-core from /home/expo/workingdir/build/node_modules/.pnpm/expo@53.0.13_@babel+core@7.27.7_@expo+metro-runtime@5.0.4_react-native@0.79.4_react@19.0.0/node_modules/expo/src/Expo.ts
```

## Root Cause
In pnpm monorepos, Metro bundler cannot resolve transitive dependencies like `expo-modules-core` (which is a dependency of `expo`) due to pnpm's symlink structure and Metro's module resolution strategy.

## Solution Applied

### 1. Added expo-modules-core as Direct Dependency
**File:** `apps/mobile-customer/package.json`
```json
{
  "dependencies": {
    "expo-modules-core": "2.4.0"
  }
}
```

### 2. Enhanced Metro Configuration
**File:** `apps/mobile-customer/metro.config.js`

#### Added Critical Expo Module Aliases
```javascript
config.resolver.alias = {
  // Core React dependencies with fallback resolution
  'react': fs.existsSync(path.resolve(projectRoot, 'node_modules/react'))
    ? path.resolve(projectRoot, 'node_modules/react')
    : path.resolve(monorepoRoot, 'node_modules/react'),
  
  // Expo core dependencies with fallback resolution
  'expo': fs.existsSync(path.resolve(projectRoot, 'node_modules/expo'))
    ? path.resolve(projectRoot, 'node_modules/expo')
    : path.resolve(monorepoRoot, 'node_modules/expo'),
  'expo-modules-core': fs.existsSync(path.resolve(projectRoot, 'node_modules/expo-modules-core'))
    ? path.resolve(projectRoot, 'node_modules/expo-modules-core')
    : path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
  // ... other Expo modules
};
```

#### Enhanced extraNodeModules Configuration
```javascript
config.resolver.extraNodeModules = {
  ...specificPackages,
  // Critical Expo modules that must be resolved correctly
  'expo-modules-core': path.resolve(monorepoRoot, 'node_modules/expo-modules-core'),
  'expo': path.resolve(monorepoRoot, 'node_modules/expo'),
  '@expo/metro-runtime': path.resolve(monorepoRoot, 'node_modules/@expo/metro-runtime'),
};
```

### 3. Updated EAS Build Configuration
**File:** `apps/mobile-customer/eas.json`

Added `EXPO_USE_METRO_WORKSPACE_ROOT` environment variable to all build profiles:
```json
{
  "build": {
    "development": {
      "env": {
        "NODE_ENV": "development",
        "EXPO_USE_METRO_WORKSPACE_ROOT": "1"
      }
    },
    "preview": {
      "env": {
        "NODE_ENV": "production",
        "EAS_BUILD": "true",
        "EXPO_USE_METRO_WORKSPACE_ROOT": "1"
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production",
        "EAS_BUILD": "true",
        "EXPO_USE_METRO_WORKSPACE_ROOT": "1"
      }
    }
  }
}
```

### 4. Updated Production Metro Config
**File:** `apps/mobile-customer/metro.config.production.js`

Added the same critical aliases and extraNodeModules for production builds.

## Key Technical Details

### Why This Fix Works
1. **Direct Dependency**: Adding `expo-modules-core` as a direct dependency ensures it's available in the dependency tree
2. **Fallback Resolution**: The Metro aliases check local node_modules first, then fall back to root node_modules
3. **extraNodeModules**: Explicitly tells Metro where to find critical modules
4. **EXPO_USE_METRO_WORKSPACE_ROOT**: Enables Expo's automatic monorepo detection

### PNPM Monorepo Compatibility
- Uses `shamefullyHoist: true` in root package.json for better compatibility
- Includes `publicHoistPattern` for Expo and React Native modules
- Maintains symlink resolution with proper fallbacks

## Verification
Run the test script to verify the fix:
```bash
cd apps/mobile-customer
node test-metro-resolution.js
```

## References
- [Expo Monorepo Documentation](https://docs.expo.dev/guides/monorepos/)
- [Metro Configuration for Monorepos](https://metrobundler.dev/docs/configuration/)
- [PNPM Workspace Configuration](https://pnpm.io/workspaces)

## Status
✅ **FIXED** - All dependency resolution tests pass
✅ **READY** - EAS Build should now work correctly
