#!/usr/bin/env node

/**
 * Comprehensive Autolinking Fix for ExpoModulesPackage
 * This script runs multiple strategies to fix the autolinking issue
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Running comprehensive autolinking fix...');

// Strategy 1: Fix existing PackageList.java files
function fixExistingPackageListFiles() {
    console.log('\n📋 Strategy 1: Fixing existing PackageList.java files...');
    
    const locations = [
        'android/app/build/generated/autolinking/src/main/java/com/facebook/react/PackageList.java',
        'android/app/src/main/java/com/facebook/react/PackageList.java',
        'android/app/build/generated/rncli/src/main/java/com/facebook/react/PackageList.java'
    ];
    
    let fixed = false;
    
    for (const location of locations) {
        if (fs.existsSync(location)) {
            console.log(`🔍 Found: ${location}`);
            try {
                let content = fs.readFileSync(location, 'utf8');
                if (content.includes('import expo.core.ExpoModulesPackage;')) {
                    console.log('🔧 Fixing incorrect import...');
                    content = content.replace(/import expo\.core\.ExpoModulesPackage;/g, 'import expo.modules.ExpoModulesPackage;');
                    fs.writeFileSync(location, content);
                    console.log('✅ Fixed import statement');
                    fixed = true;
                } else {
                    console.log('ℹ️  Import already correct');
                }
            } catch (error) {
                console.log(`❌ Error fixing ${location}: ${error.message}`);
            }
        }
    }
    
    return fixed;
}

// Strategy 2: Create a custom PackageList.java template
function createCustomPackageList() {
    console.log('\n📋 Strategy 2: Creating custom PackageList.java template...');
    
    const packageListTemplate = `package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.List;

// Expo modules
import expo.modules.ExpoModulesPackage;

public class PackageList {
  private Application mApplication;
  private ReactNativeHost mReactNativeHost;
  private MainPackageConfig mConfig;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost, null);
  }

  public PackageList(Application application) {
    this(application, null);
  }

  public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
    mReactNativeHost = reactNativeHost;
    mConfig = config;
  }

  public PackageList(Application application, MainPackageConfig config) {
    mReactNativeHost = null;
    mApplication = application;
    mConfig = config;
  }

  private ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  private Resources getResources() {
    return getApplication().getResources();
  }

  private Application getApplication() {
    if (mApplication == null) mApplication = getReactNativeHost().getApplication();
    return mApplication;
  }

  private Context getApplicationContext() {
    return getApplication().getApplicationContext();
  }

  public List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
      new MainReactPackage(mConfig),
      new ExpoModulesPackage()
    );
  }
}`;

    const packageListDir = 'android/app/src/main/java/com/facebook/react';
    const packageListPath = path.join(packageListDir, 'PackageList.java');
    
    try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(packageListDir)) {
            fs.mkdirSync(packageListDir, { recursive: true });
            console.log(`📁 Created directory: ${packageListDir}`);
        }
        
        // Write the custom PackageList.java
        fs.writeFileSync(packageListPath, packageListTemplate);
        console.log(`✅ Created custom PackageList.java at: ${packageListPath}`);
        return true;
    } catch (error) {
        console.log(`❌ Error creating custom PackageList.java: ${error.message}`);
        return false;
    }
}

// Strategy 3: Modify react-native.config.js to override autolinking
function updateReactNativeConfig() {
    console.log('\n📋 Strategy 3: Updating react-native.config.js...');
    
    const configPath = 'react-native.config.js';
    const configContent = `module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.tap2go.mobile',
    },
  },
  dependencies: {
    // Disable autolinking for expo-modules-core as it's handled by expo package
    'expo-modules-core': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    // Override expo autolinking to use correct package
    'expo': {
      platforms: {
        android: {
          sourceDir: '../../../node_modules/expo/android',
          packageImportPath: 'import expo.modules.ExpoModulesPackage;',
        },
      },
    },
  },
};`;
    
    try {
        fs.writeFileSync(configPath, configContent);
        console.log('✅ Updated react-native.config.js');
        return true;
    } catch (error) {
        console.log(`❌ Error updating react-native.config.js: ${error.message}`);
        return false;
    }
}

// Strategy 4: Create a watcher that continuously fixes the issue
function createContinuousWatcher() {
    console.log('\n📋 Strategy 4: Setting up continuous watcher...');
    
    const watcherScript = `#!/usr/bin/env node

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
                content = content.replace(/import expo\\.core\\.ExpoModulesPackage;/g, 'import expo.modules.ExpoModulesPackage;');
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
}`;
    
    try {
        fs.writeFileSync('autolinking-watcher.js', watcherScript);
        console.log('✅ Created autolinking watcher script');
        return true;
    } catch (error) {
        console.log(`❌ Error creating watcher: ${error.message}`);
        return false;
    }
}

// Run all strategies
async function runAllStrategies() {
    console.log('🚀 Running all autolinking fix strategies...\n');
    
    const results = {
        strategy1: fixExistingPackageListFiles(),
        strategy2: createCustomPackageList(),
        strategy3: updateReactNativeConfig(),
        strategy4: createContinuousWatcher()
    };
    
    console.log('\n📊 Strategy Results:');
    console.log(`Strategy 1 (Fix existing): ${results.strategy1 ? '✅' : '❌'}`);
    console.log(`Strategy 2 (Custom template): ${results.strategy2 ? '✅' : '❌'}`);
    console.log(`Strategy 3 (Config update): ${results.strategy3 ? '✅' : '❌'}`);
    console.log(`Strategy 4 (Watcher): ${results.strategy4 ? '✅' : '❌'}`);
    
    console.log('\n🎯 Comprehensive autolinking fix completed!');
}

// Run if called directly
if (require.main === module) {
    runAllStrategies();
}

module.exports = { runAllStrategies };
