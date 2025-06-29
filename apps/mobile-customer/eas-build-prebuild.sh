#!/bin/bash

# EAS Build Prebuild Hook for Tap2Go Mobile Customer
# This script runs before the build process to ensure expo CLI is available

echo "🔧 EAS Build Prebuild Hook - Ensuring Expo CLI availability"

# Check if we're in EAS Build environment
if [ "$EAS_BUILD" = "true" ] || [ "$CI" = "true" ]; then
    echo "✅ EAS Build environment detected"


    
    # Check if local expo CLI is available
    if [ -f "node_modules/expo/bin/cli" ]; then
        echo "✅ Local expo CLI found at node_modules/expo/bin/cli"
    else
        echo "⚠️  Local expo CLI not found, checking alternatives..."
        
        # Check if global expo CLI is available
        if command -v expo >/dev/null 2>&1; then
            echo "✅ Global expo CLI is available"
            
            # Create a wrapper script that uses the global expo CLI
            mkdir -p node_modules/expo/bin
            cat > node_modules/expo/bin/cli << 'EOF'
#!/bin/bash
# Wrapper script to use global expo CLI
exec expo "$@"
EOF
            chmod +x node_modules/expo/bin/cli
            echo "✅ Created wrapper script for global expo CLI"
        else
            echo "❌ No expo CLI found (local or global)"
            echo "🔍 Attempting to install expo CLI globally..."
            
            # Try to install expo CLI globally
            if npm install -g @expo/cli; then
                echo "✅ Successfully installed expo CLI globally"
                
                # Create wrapper script
                mkdir -p node_modules/expo/bin
                cat > node_modules/expo/bin/cli << 'EOF'
#!/bin/bash
# Wrapper script to use global expo CLI
exec expo "$@"
EOF
                chmod +x node_modules/expo/bin/cli
                echo "✅ Created wrapper script for newly installed expo CLI"
            else
                echo "❌ Failed to install expo CLI globally"
                echo "🔍 Trying alternative approach with npx..."
                
                # Create wrapper script that uses npx
                mkdir -p node_modules/expo/bin
                cat > node_modules/expo/bin/cli << 'EOF'
#!/bin/bash
# Wrapper script to use npx expo
exec npx expo "$@"
EOF
                chmod +x node_modules/expo/bin/cli
                echo "✅ Created wrapper script using npx expo"
            fi
        fi
    fi
    
    # Final verification
    if [ -f "node_modules/expo/bin/cli" ] && [ -x "node_modules/expo/bin/cli" ]; then
        echo "✅ Expo CLI is now available at node_modules/expo/bin/cli"
        
        # Test the CLI
        if node_modules/expo/bin/cli --version >/dev/null 2>&1; then
            echo "✅ Expo CLI test successful"
        else
            echo "⚠️  Expo CLI test failed, but continuing with build"
        fi
    else
        echo "❌ Failed to make expo CLI available"
        echo "🔍 Build may fail at Bundle JavaScript phase"
    fi
    
else
    echo "⚠️  Not in EAS Build environment, skipping prebuild setup"
fi

echo "🎯 Prebuild hook completed"
