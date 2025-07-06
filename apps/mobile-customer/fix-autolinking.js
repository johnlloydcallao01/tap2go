#!/usr/bin/env node

/**
 * Fix Autolinking Script for ExpoModulesPackage Import Issue
 * This script fixes the incorrect import path in generated autolinking files
 * Issue: expo.core.ExpoModulesPackage should be expo.modules.ExpoModulesPackage
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running autolinking fix for ExpoModulesPackage...');

// Function to fix PackageList.java import
function fixPackageListImport(packageListFile) {
    if (!fs.existsSync(packageListFile)) {
        console.log(`⚠️  PackageList.java not found at: ${packageListFile}`);
        return false;
    }
    
    console.log(`🔍 Found PackageList.java at: ${packageListFile}`);
    
    try {
        let content = fs.readFileSync(packageListFile, 'utf8');
        
        // Check if the file contains the incorrect import
        if (content.includes('import expo.core.ExpoModulesPackage;')) {
            console.log('🔧 Fixing incorrect import: expo.core.ExpoModulesPackage -> expo.modules.ExpoModulesPackage');
            
            // Create backup
            const backupFile = packageListFile + '.backup';
            fs.writeFileSync(backupFile, content);
            console.log(`💾 Created backup: ${backupFile}`);
            
            // Fix the import statement
            content = content.replace(/import expo\.core\.ExpoModulesPackage;/g, 'import expo.modules.ExpoModulesPackage;');
            
            // Write the fixed content
            fs.writeFileSync(packageListFile, content);
            
            // Verify the fix
            const fixedContent = fs.readFileSync(packageListFile, 'utf8');
            if (fixedContent.includes('import expo.modules.ExpoModulesPackage;')) {
                console.log('✅ Successfully fixed import statement');
                return true;
            } else {
                console.log('❌ Failed to fix import statement, restoring backup');
                fs.writeFileSync(packageListFile, content);
                return false;
            }
        } else {
            console.log('ℹ️  No incorrect import found in PackageList.java');
            return true;
        }
    } catch (error) {
        console.log(`❌ Error processing ${packageListFile}: ${error.message}`);
        return false;
    }
}

// Search for PackageList.java in common locations
const packageListLocations = [
    'android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java',
    'android/app/src/main/java/com/facebook/react/PackageList.java',
    'android/app/build/generated/rncli/src/main/java/com/facebook/react/PackageList.java'
];

let fixed = false;

for (const location of packageListLocations) {
    if (fs.existsSync(location)) {
        console.log(`📁 Checking: ${location}`);
        if (fixPackageListImport(location)) {
            fixed = true;
        }
    } else {
        console.log(`📁 Not found: ${location}`);
    }
}

// If no files found, search recursively
if (!fixed && fs.existsSync('android')) {
    console.log('🔍 Searching recursively for PackageList.java files...');
    
    function findPackageListFiles(dir) {
        const files = [];
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    files.push(...findPackageListFiles(fullPath));
                } else if (item === 'PackageList.java') {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Ignore permission errors
        }
        return files;
    }
    
    const foundFiles = findPackageListFiles('android');
    for (const file of foundFiles) {
        console.log(`📁 Found: ${file}`);
        fixPackageListImport(file);
    }
}

console.log('✅ Autolinking fix completed');

// Also create a prebuild hook that will run this script
const prebuildHook = `#!/bin/bash
echo "🔧 Running prebuild autolinking fix..."
node fix-autolinking.js
`;

fs.writeFileSync('prebuild-hook.sh', prebuildHook);
console.log('✅ Created prebuild-hook.sh');

process.exit(0);
