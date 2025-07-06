#!/bin/bash

# EAS Build Hook to Fix ExpoModulesPackage Import Issue
# This script fixes the incorrect import path in generated autolinking files
# Issue: expo.core.ExpoModulesPackage should be expo.modules.ExpoModulesPackage

set -e

echo "🔧 EAS Build Fix Autolinking Hook Starting..."

# Check if we're in EAS build environment
if [ -z "$EAS_BUILD_WORKINGDIR" ]; then
    echo "ℹ️  Not in EAS build environment, skipping autolinking fix"
    exit 0
fi

echo "📍 Current working directory: $(pwd)"
echo "📍 EAS_BUILD_WORKINGDIR: $EAS_BUILD_WORKINGDIR"

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

# Wait for autolinking to generate files (this runs after prebuild)
echo "⏳ Waiting for autolinking files to be generated..."
sleep 10

# Also check if prebuild has completed by looking for android directory
if [ ! -d "android" ]; then
    echo "⚠️  Android directory not found, prebuild may not have completed yet"
    echo "⏳ Waiting additional time for prebuild to complete..."
    sleep 15
fi

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
if [ "$FIXED" = false ]; then
    echo "🔍 Searching recursively for PackageList.java files..."
    
    find . -name "PackageList.java" -type f 2>/dev/null | while read -r file; do
        echo "📁 Found: $file"
        fix_package_list_import "$file"
    done
fi

echo "✅ EAS Build Fix Autolinking Hook Completed"
