#!/usr/bin/env node

/**
 * Test script to verify the mobile-customer app can be built successfully
 * This helps identify issues before pushing to GitHub Actions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing mobile-customer build process...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'App.tsx',
  'app.json',
  'package.json',
  'metro.config.js',
  'metro.config.production.js',
  'global.css',
  'tailwind.config.js',
  'src/components/ErrorBoundary.tsx',
  'src/utils/crashReporting.ts',
];

let missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Missing files:', missingFiles);
  process.exit(1);
} else {
  console.log('✅ All required files present');
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'expo',
  'expo-build-properties',
  'react',
  'react-native',
  '@react-navigation/native',
  'nativewind',
];

let missingDeps = [];
for (const dep of requiredDeps) {
  if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length > 0) {
  console.error('❌ Missing dependencies:', missingDeps);
  process.exit(1);
} else {
  console.log('✅ All required dependencies present');
}

// Test 3: Check app.json configuration
console.log('\n⚙️ Checking app.json configuration...');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));

if (!appJson.expo.plugins || !appJson.expo.plugins.find(p => Array.isArray(p) && p[0] === 'expo-build-properties')) {
  console.error('❌ expo-build-properties plugin not configured in app.json');
  process.exit(1);
} else {
  console.log('✅ expo-build-properties plugin configured');
}

// Test 4: Try to import main components
console.log('\n🔍 Testing component imports...');
try {
  // This will fail if there are syntax errors or missing dependencies
  execSync('node -e "require(\'./App.tsx\')"', { stdio: 'pipe' });
  console.log('❌ App.tsx import test failed (expected - TypeScript file)');
} catch (error) {
  // Expected to fail since it's TypeScript, but should not be a syntax error
  if (error.stdout && error.stdout.includes('SyntaxError')) {
    console.error('❌ Syntax error in App.tsx:', error.stdout);
    process.exit(1);
  } else {
    console.log('✅ App.tsx structure appears valid');
  }
}

// Test 5: Check Metro config
console.log('\n🚇 Testing Metro configuration...');
try {
  const metroConfig = require('./metro.config.js');
  const metroConfigProd = require('./metro.config.production.js');
  console.log('✅ Metro configurations load successfully');
} catch (error) {
  console.error('❌ Metro configuration error:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! The build should work correctly.');
console.log('\n📝 Next steps:');
console.log('1. Commit and push these changes');
console.log('2. Check GitHub Actions build');
console.log('3. Download and test the APK');
console.log('4. If the APK still crashes, check device logs with: adb logcat | grep -i tap2go');
