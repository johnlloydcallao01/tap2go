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

    # Function to fix PackageList.java import
    fix_package_list_import() {
        local package_list_file="$1"

        if [ ! -f "$package_list_file" ]; then
            echo "⚠️  PackageList.java not found at: $package_list_file"
            return 1
        fi

        echo "🔍 Found PackageList.java at: $package_list_file"

        # Check if the file contains the incorrect import
        if grep -q "import expo.core.ExpoModulesPackage;" "$package_list_file"; then
            echo "🔧 Fixing incorrect import: expo.core.ExpoModulesPackage -> expo.modules.ExpoModulesPackage"

            # Create backup
            cp "$package_list_file" "$package_list_file.backup"
            echo "💾 Created backup: $package_list_file.backup"

            # Fix the import statement
            sed -i 's/import expo\.core\.ExpoModulesPackage;/import expo.modules.ExpoModulesPackage;/g' "$package_list_file"

            # Verify the fix
            if grep -q "import expo.modules.ExpoModulesPackage;" "$package_list_file"; then
                echo "✅ Successfully fixed import statement"
                return 0
            else
                echo "❌ Failed to fix import statement, restoring backup"
                mv "$package_list_file.backup" "$package_list_file"
                return 1
            fi
        else
            echo "ℹ️  No incorrect import found in PackageList.java"
            return 0
        fi
    }

    # Wait for autolinking to complete and fix PackageList.java
    echo "🔧 Checking for autolinking issues..."
    sleep 5

    # Search for PackageList.java in common locations
    PACKAGE_LIST_LOCATIONS=(
        "android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java"
        "android/app/src/main/java/com/facebook/react/PackageList.java"
        "android/app/build/generated/rncli/src/main/java/com/facebook/react/PackageList.java"
    )

    FIXED=false

    for location in "${PACKAGE_LIST_LOCATIONS[@]}"; do
        if [ -f "$location" ]; then
            echo "📁 Checking: $location"
            if fix_package_list_import "$location"; then
                FIXED=true
            fi
        else
            echo "📁 Not found: $location"
        fi
    done

    # If no files found, search recursively
    if [ "$FIXED" = false ] && [ -d "android" ]; then
        echo "🔍 Searching recursively for PackageList.java files..."

        find android -name "PackageList.java" -type f 2>/dev/null | while read -r file; do
            echo "📁 Found: $file"
            fix_package_list_import "$file"
        done
    fi

echo "🎯 Prebuild hook completed"
