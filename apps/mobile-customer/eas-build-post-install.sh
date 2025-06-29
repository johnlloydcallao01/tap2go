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

    # Verify scheduler module
    echo "🔍 Verifying scheduler..."
    if [ -d "../../node_modules/scheduler" ]; then
        echo "✅ scheduler found in root node_modules"
        if [ -f "../../node_modules/scheduler/index.native.js" ]; then
            echo "✅ scheduler/index.native.js exists"
        else
            echo "❌ scheduler/index.native.js NOT found"
            exit 1
        fi
    else
        echo "❌ scheduler NOT found in root node_modules"
        exit 1
    fi
    
    # Test Metro config loading
    echo "🔧 Testing Metro configuration..."
    if node -e "require('./metro.config.eas.js'); console.log('✅ EAS Metro config loads successfully')"; then
        echo "✅ EAS Metro configuration is valid"
    else
        echo "❌ EAS Metro configuration has errors"
        exit 1
    fi

    # Test scheduler resolution specifically
    echo "🔧 Testing scheduler module resolution..."
    if node -e "
        const path = require('path');
        const fs = require('fs');
        const schedulerPath = path.resolve('../../node_modules/scheduler/index.native.js');
        if (fs.existsSync(schedulerPath)) {
            const scheduler = require(schedulerPath);
            if (typeof scheduler.unstable_scheduleCallback === 'function') {
                console.log('✅ Scheduler module resolution successful');
            } else {
                console.log('❌ Scheduler missing expected exports');
                process.exit(1);
            }
        } else {
            console.log('❌ Scheduler native file not found');
            process.exit(1);
        }
    "; then
        echo "✅ Scheduler module verification passed"
    else
        echo "❌ Scheduler module verification failed"
        exit 1
    fi
    
    echo "✅ All dependency verifications passed"
else
    echo "⚠️  Not in EAS Build environment, skipping verifications"
fi

echo "🎯 Post-install hook completed successfully"
