#!/usr/bin/env node

/**
 * Test script to verify Metro can resolve expo-modules-core
 * Run this before EAS build to ensure dependencies are properly configured
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing Metro dependency resolution...');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Test critical dependencies
const criticalDeps = [
  'expo',
  'expo-modules-core',
  '@expo/metro-runtime',
  'react',
  'react-native',
  'expo-router',
  'expo-constants',
];

let allResolved = true;

console.log('\n📦 Checking dependency resolution:');

criticalDeps.forEach(dep => {
  const localPath = path.resolve(projectRoot, 'node_modules', dep);
  const rootPath = path.resolve(monorepoRoot, 'node_modules', dep);
  
  const localExists = fs.existsSync(localPath);
  const rootExists = fs.existsSync(rootPath);
  
  if (localExists) {
    console.log(`✅ ${dep}: Found in local node_modules`);
  } else if (rootExists) {
    console.log(`✅ ${dep}: Found in root node_modules`);
  } else {
    console.log(`❌ ${dep}: NOT FOUND`);
    allResolved = false;
  }
});

// Test Metro config loading
console.log('\n🔧 Testing Metro config:');
try {
  const metroConfig = require('./metro.config.js');
  console.log('✅ Metro config loads successfully');
  
  // Check if aliases are configured
  if (metroConfig.resolver && metroConfig.resolver.alias) {
    const aliases = Object.keys(metroConfig.resolver.alias);
    console.log(`✅ Metro aliases configured: ${aliases.length} dependencies`);
    
    if (aliases.includes('expo-modules-core')) {
      console.log('✅ expo-modules-core alias configured');
    } else {
      console.log('❌ expo-modules-core alias missing');
      allResolved = false;
    }
  } else {
    console.log('❌ Metro aliases not configured');
    allResolved = false;
  }
  
  // Check extraNodeModules
  if (metroConfig.resolver && metroConfig.resolver.extraNodeModules) {
    const extraModules = Object.keys(metroConfig.resolver.extraNodeModules);
    console.log(`✅ Metro extraNodeModules configured: ${extraModules.length} modules`);
  }
  
} catch (error) {
  console.log(`❌ Metro config error: ${error.message}`);
  allResolved = false;
}

// Test package.json
console.log('\n📋 Testing package.json:');
try {
  const packageJson = require('./package.json');
  
  if (packageJson.dependencies && packageJson.dependencies['expo-modules-core']) {
    console.log('✅ expo-modules-core listed in dependencies');
  } else {
    console.log('❌ expo-modules-core missing from dependencies');
    allResolved = false;
  }
  
  if (packageJson.dependencies && packageJson.dependencies['expo']) {
    console.log('✅ expo listed in dependencies');
  } else {
    console.log('❌ expo missing from dependencies');
    allResolved = false;
  }
  
} catch (error) {
  console.log(`❌ package.json error: ${error.message}`);
  allResolved = false;
}

console.log('\n' + '='.repeat(50));
if (allResolved) {
  console.log('🎉 All dependency resolution tests PASSED!');
  console.log('✅ Ready for EAS Build');
  process.exit(0);
} else {
  console.log('❌ Some dependency resolution tests FAILED!');
  console.log('🔧 Please fix the issues above before running EAS Build');
  process.exit(1);
}
