#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting autolinking watcher...');

const packageListPath = 'android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java';

function fixPackageList() {
    if (fs.existsSync(packageListPath)) {
        try {
            let content = fs.readFileSync(packageListPath, 'utf8');
            if (content.includes('import expo.core.ExpoModulesPackage;')) {
                console.log('🔧 Watcher: Fixing incorrect import...');
                content = content.replace(/import expo\.core\.ExpoModulesPackage;/g, 'import expo.modules.ExpoModulesPackage;');
                fs.writeFileSync(packageListPath, content);
                console.log('✅ Watcher: Fixed import statement');
            }
        } catch (error) {
            console.log('❌ Watcher error:', error.message);
        }
    }
}

// Run fix immediately
fixPackageList();

// Watch for changes
if (fs.existsSync('android')) {
    const watcher = fs.watch('android', { recursive: true }, (eventType, filename) => {
        if (filename && filename.includes('PackageList.java')) {
            console.log('📁 Watcher: PackageList.java changed, applying fix...');
            setTimeout(fixPackageList, 1000); // Delay to ensure file is written
        }
    });
    
    console.log('👀 Watcher: Monitoring android directory for PackageList.java changes...');
    
    // Keep the process alive for a reasonable time
    setTimeout(() => {
        watcher.close();
        console.log('🛑 Watcher: Stopped monitoring');
    }, 300000); // 5 minutes
}