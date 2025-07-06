#!/usr/bin/env node

/**
 * Test script to verify App resolution works correctly
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing App Resolution...\n');

const projectRoot = __dirname;
console.log('📁 Project root:', projectRoot);

// Test 1: Check if App.tsx exists
const appPath = path.resolve(projectRoot, 'App.tsx');
console.log('🔍 Checking App.tsx:', appPath);
if (fs.existsSync(appPath)) {
  console.log('✅ App.tsx exists');
} else {
  console.log('❌ App.tsx not found');
}

// Test 2: Check if AppEntry.js exists
const appEntryPath = path.resolve(projectRoot, 'AppEntry.js');
console.log('🔍 Checking AppEntry.js:', appEntryPath);
if (fs.existsSync(appEntryPath)) {
  console.log('✅ AppEntry.js exists');
} else {
  console.log('❌ AppEntry.js not found');
}

// Test 3: Check package.json main field
const packageJsonPath = path.resolve(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('🔍 Package.json main field:', packageJson.main);
    
    const mainPath = path.resolve(projectRoot, packageJson.main);
    if (fs.existsSync(mainPath)) {
      console.log('✅ Main entry point exists:', mainPath);
    } else {
      console.log('❌ Main entry point not found:', mainPath);
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
} else {
  console.log('❌ package.json not found');
}

// Test 4: Test Metro config
const metroConfigPath = path.resolve(projectRoot, 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  console.log('✅ metro.config.js exists');
  
  try {
    const metroConfig = require(metroConfigPath);
    if (metroConfig.resolver && metroConfig.resolver.resolveRequest) {
      console.log('✅ Custom resolver configured');
      
      // Test the resolver with the problematic module name
      const mockContext = {
        resolveRequest: () => ({ filePath: 'default', type: 'sourceFile' }),
        originModulePath: path.resolve(projectRoot, 'node_modules/expo/AppEntry.js')
      };
      
      try {
        const result = metroConfig.resolver.resolveRequest(mockContext, '../../App', 'android');
        if (result && result.filePath && result.filePath.includes('App.tsx')) {
          console.log('✅ Custom resolver correctly resolves "../../App" to:', result.filePath);
        } else {
          console.log('⚠️  Custom resolver returned:', result);
        }
      } catch (error) {
        console.log('❌ Error testing custom resolver:', error.message);
      }
    } else {
      console.log('⚠️  Custom resolver not configured');
    }
  } catch (error) {
    console.log('❌ Error loading metro.config.js:', error.message);
  }
} else {
  console.log('❌ metro.config.js not found');
}

console.log('\n🎯 App Resolution Test Complete');
console.log('📝 Summary: The permanent solution should prevent "Unable to resolve ../../App" errors');
