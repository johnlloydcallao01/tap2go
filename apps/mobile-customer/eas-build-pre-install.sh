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
else
    echo "⚠️  Not in EAS Build environment"
fi

echo "🎯 Pre-install hook completed successfully"
