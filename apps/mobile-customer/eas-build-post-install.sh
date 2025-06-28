#!/bin/bash

# EAS Build Post-Install Hook for Tap2Go Mobile Customer
# This script runs after pnpm install in EAS Build environment

echo "🔧 EAS Build Post-Install Hook - Tap2Go Mobile Customer"
echo "📦 Verifying dependency resolution..."

# Check if we're in EAS Build environment
if [ "$EAS_BUILD" = "true" ] || [ "$CI" = "true" ]; then
    echo "✅ EAS Build environment detected"
    
    # Verify critical dependencies are available
    echo "🔍 Verifying expo-modules-core..."
    if [ -d "../../node_modules/expo-modules-core" ]; then
        echo "✅ expo-modules-core found in root node_modules"
    else
        echo "❌ expo-modules-core NOT found in root node_modules"
        exit 1
    fi
    
    # Verify expo is available
    echo "🔍 Verifying expo..."
    if [ -d "../../node_modules/expo" ]; then
        echo "✅ expo found in root node_modules"
    else
        echo "❌ expo NOT found in root node_modules"
        exit 1
    fi
    
    # Verify Metro runtime
    echo "🔍 Verifying @expo/metro-runtime..."
    if [ -d "../../node_modules/@expo/metro-runtime" ]; then
        echo "✅ @expo/metro-runtime found in root node_modules"
    else
        echo "❌ @expo/metro-runtime NOT found in root node_modules"
        exit 1
    fi
    
    # Test Metro config loading
    echo "🔧 Testing Metro configuration..."
    if node -e "require('./metro.config.js'); console.log('✅ Metro config loads successfully')"; then
        echo "✅ Metro configuration is valid"
    else
        echo "❌ Metro configuration has errors"
        exit 1
    fi
    
    echo "✅ All dependency verifications passed"
else
    echo "⚠️  Not in EAS Build environment, skipping verifications"
fi

echo "🎯 Post-install hook completed successfully"
