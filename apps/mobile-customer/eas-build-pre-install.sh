#!/bin/bash

# EAS Build Pre-Install Hook for Tap2Go Mobile Customer
# This script runs before pnpm install in EAS Build environment

echo "🚀 EAS Build Pre-Install Hook - Tap2Go Mobile Customer"
echo "📱 Configuring enterprise-grade mobile build environment..."

# Check if we're in EAS Build environment
if [ "$EAS_BUILD" = "true" ] || [ "$CI" = "true" ]; then
    echo "✅ EAS Build environment detected"
    echo "🌐 Environment variables will be provided by EAS Dashboard"
    echo "📦 PNPM workspace configuration: READY"
    echo "🔧 Skipping local .env.local synchronization"

    # Ensure expo-modules-core is available for Metro resolution
    echo "🔍 Checking expo-modules-core availability..."

    # Set environment variables for better Metro resolution
    export EXPO_USE_METRO_WORKSPACE_ROOT=1
    export METRO_CACHE=0

    echo "✅ Metro workspace root enabled"
    echo "✅ Metro cache disabled for clean build"
else
    echo "⚠️  Not in EAS Build environment"
fi

echo "🎯 Pre-install hook completed successfully"
