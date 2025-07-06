#!/bin/bash

# EAS Build Post-Install Hook for Tap2Go Mobile Customer
# This script runs after pnpm install in EAS Build environment

echo "🚀 EAS Build Post-Install Hook - Tap2Go Mobile Customer"

# Check if we're in EAS Build environment
if [ "$EAS_BUILD" = "true" ] || [ "$CI" = "true" ]; then
    echo "✅ EAS Build environment detected"

    # SKIP EXPO DOCTOR IN EAS BUILD - BEST PRACTICE FOR MONOREPOS
    echo "ℹ️  Skipping Expo Doctor in EAS build (recommended for monorepos)"
    echo "✅ Run 'pnpm run doctor' locally before building to validate project"
    echo "📋 This prevents timeout issues in large monorepo environments"

    # FIX AUTOLINKING IMPORT ISSUE - CRITICAL FOR EXPO SDK 53+
    echo "🔧 Applying autolinking import fix for ExpoModulesPackage..."

    # Copy the React Native config override to fix autolinking
    if [ -f "react-native.config.override.js" ]; then
        echo "📋 Copying React Native config override..."
        cp react-native.config.override.js react-native.config.js
        echo "✅ React Native config override applied"
    fi

    # Run the autolinking import fix
    if [ -f "fix-autolinking-imports.js" ]; then
        echo "🔧 Running autolinking import fix..."
        node fix-autolinking-imports.js
        echo "✅ Autolinking import fix completed"
    fi

    echo "✅ Autolinking fixes applied successfully"
else
    echo "⚠️ Not in EAS Build environment"
fi

echo "🎯 Post-install hook completed successfully"


