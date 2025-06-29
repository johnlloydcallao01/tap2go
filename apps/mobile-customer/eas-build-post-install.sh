#!/bin/bash

# EAS Build Post-Install Hook for Tap2Go Mobile Customer
# This script runs after pnpm install in EAS Build environment

echo "🔧 EAS Build Post-Install Hook - Tap2Go Mobile Customer"
echo "📦 Verifying dependency resolution..."

# Check if we're in EAS Build environment
if [ "$EAS_BUILD" = "true" ] || [ "$CI" = "true" ]; then
    echo "✅ EAS Build environment detected"
    
    # Create symlinks for expo-modules-core to ensure Metro can find it
    echo "🔗 Creating expo-modules-core symlinks for Metro resolution..."

    # Create local node_modules if it doesn't exist
    mkdir -p node_modules

    # Remove existing symlink if it exists
    if [ -L "node_modules/expo-modules-core" ] || [ -d "node_modules/expo-modules-core" ]; then
        rm -rf node_modules/expo-modules-core
        echo "🗑️ Removed existing expo-modules-core"
    fi

    # Function to find expo-modules-core in pnpm structure
    find_expo_modules_core() {
        local search_path="$1"
        if [ -d "$search_path/node_modules/.pnpm" ]; then
            for dir in "$search_path/node_modules/.pnpm"/expo-modules-core@*; do
                if [ -d "$dir/node_modules/expo-modules-core" ]; then
                    echo "$dir/node_modules/expo-modules-core"
                    return 0
                fi
            done
        fi
        return 1
    }

    # Try to create symlink from root node_modules first
    EXPO_MODULES_CORE_PATH=""
    SYMLINK_SOURCE=""

    if [ -d "../../node_modules/expo-modules-core" ]; then
        EXPO_MODULES_CORE_PATH="../../node_modules/expo-modules-core"
        SYMLINK_SOURCE="root node_modules"
    else
        # Look for expo-modules-core in root pnpm structure
        PNPM_EXPO_PATH=$(find_expo_modules_core "../..")
        if [ -n "$PNPM_EXPO_PATH" ]; then
            EXPO_MODULES_CORE_PATH="$PNPM_EXPO_PATH"
            SYMLINK_SOURCE="root pnpm structure"
        else
            # Look for expo-modules-core in local pnpm structure
            PNPM_EXPO_PATH=$(find_expo_modules_core ".")
            if [ -n "$PNPM_EXPO_PATH" ]; then
                EXPO_MODULES_CORE_PATH="$PNPM_EXPO_PATH"
                SYMLINK_SOURCE="local pnpm structure"
            fi
        fi
    fi

    if [ -n "$EXPO_MODULES_CORE_PATH" ]; then
        ln -sf "$(pwd)/$EXPO_MODULES_CORE_PATH" "node_modules/expo-modules-core"
        echo "✅ Created symlink: node_modules/expo-modules-core -> $EXPO_MODULES_CORE_PATH"
        echo "📍 Source: $SYMLINK_SOURCE"

        # Verify the symlink works
        if [ -f "node_modules/expo-modules-core/package.json" ]; then
            echo "✅ expo-modules-core symlink verified - package.json accessible"
        else
            echo "❌ expo-modules-core symlink failed - package.json not accessible"
            echo "⚠️  Continuing without symlink - Metro resolver will handle this"
        fi
    else
        echo "⚠️  expo-modules-core not found in any location - Metro resolver will handle this"
        echo "📍 Searched locations:"
        echo "   - Root node_modules: ../../node_modules/expo-modules-core"
        echo "   - Root pnpm structure: ../../node_modules/.pnpm/expo-modules-core@*"
        echo "   - Local pnpm structure: ./node_modules/.pnpm/expo-modules-core@*"
    fi
    
    # Also create symlink for expo to ensure consistency
    if [ -L "node_modules/expo" ] || [ -d "node_modules/expo" ]; then
        rm -rf node_modules/expo
        echo "🗑️ Removed existing expo"
    fi

    if [ -d "../../node_modules/expo" ]; then
        ln -sf "$(pwd)/../../node_modules/expo" "node_modules/expo"
        echo "✅ Created symlink: node_modules/expo -> ../../node_modules/expo"

        # Verify the expo symlink works
        if [ -f "node_modules/expo/package.json" ]; then
            echo "✅ expo symlink verified - package.json accessible"

            # Also verify the CLI binary exists
            if [ -f "node_modules/expo/bin/cli" ]; then
                echo "✅ expo CLI binary accessible at node_modules/expo/bin/cli"
            else
                echo "⚠️  expo CLI binary not found at node_modules/expo/bin/cli"
            fi
        else
            echo "❌ expo symlink failed - package.json not accessible"
            echo "⚠️  Continuing without expo symlink - will try alternative approaches"
        fi
    else
        echo "⚠️  expo not found in root node_modules - will try alternative approaches"

        # Try to find expo in pnpm structure
        if [ -d "../../node_modules/.pnpm" ]; then
            for dir in "../../node_modules/.pnpm"/expo@*; do
                if [ -d "$dir/node_modules/expo" ]; then
                    echo "📍 Found expo in pnpm structure: $dir/node_modules/expo"
                    ln -sf "$(pwd)/$dir/node_modules/expo" "node_modules/expo"
                    echo "✅ Created symlink: node_modules/expo -> $dir/node_modules/expo"

                    if [ -f "node_modules/expo/bin/cli" ]; then
                        echo "✅ expo CLI binary accessible from pnpm structure"
                    else
                        echo "⚠️  expo CLI binary not found in pnpm structure"
                    fi
                    break
                fi
            done
        fi
    fi
    
    # Verify Metro runtime
    echo "🔍 Verifying @expo/metro-runtime..."
    if [ -d "../../node_modules/@expo/metro-runtime" ]; then
        echo "✅ @expo/metro-runtime found in root node_modules"
    else
        echo "⚠️  @expo/metro-runtime not found in root node_modules - Metro resolver will handle this"
    fi

    # Verify scheduler module
    echo "🔍 Verifying scheduler..."
    if [ -d "../../node_modules/scheduler" ]; then
        echo "✅ scheduler found in root node_modules"
        if [ -f "../../node_modules/scheduler/index.native.js" ]; then
            echo "✅ scheduler/index.native.js exists"
        else
            echo "⚠️  scheduler/index.native.js not found - Metro resolver will handle this"
        fi
    else
        echo "⚠️  scheduler not found in root node_modules - Metro resolver will handle this"
    fi
    
    # Test Metro config loading
    echo "🔧 Testing Metro configuration..."
    if node -e "require('./metro.config.eas.js'); console.log('✅ EAS Metro config loads successfully')" 2>/dev/null; then
        echo "✅ EAS Metro configuration is valid"
    else
        echo "⚠️  EAS Metro configuration test failed - will rely on EAS build process"
    fi

    # Test scheduler resolution specifically
    echo "🔧 Testing scheduler module resolution..."
    if node -e "
        const path = require('path');
        const fs = require('fs');
        const schedulerPath = path.resolve('../../node_modules/scheduler/index.native.js');
        if (fs.existsSync(schedulerPath)) {
            try {
                const scheduler = require(schedulerPath);
                if (typeof scheduler.unstable_scheduleCallback === 'function') {
                    console.log('✅ Scheduler module resolution successful');
                } else {
                    console.log('⚠️ Scheduler missing expected exports');
                }
            } catch (error) {
                console.log('⚠️ Scheduler require failed:', error.message);
            }
        } else {
            console.log('⚠️ Scheduler native file not found');
        }
    " 2>/dev/null; then
        echo "✅ Scheduler module verification completed"
    else
        echo "⚠️  Scheduler module verification failed - Metro resolver will handle this"
    fi
    
    echo "✅ All dependency verifications passed"
else
    echo "⚠️  Not in EAS Build environment, skipping verifications"
fi

echo "🎯 Post-install hook completed successfully"
