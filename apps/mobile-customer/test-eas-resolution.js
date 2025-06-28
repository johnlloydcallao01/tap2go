#!/usr/bin/env node

/**
 * EAS Build Module Resolution Test
 * 
 * This script validates that all critical modules can be resolved
 * in the EAS build environment, specifically testing expo-modules-core
 * resolution that was causing the Bundle JavaScript phase to fail.
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing EAS Build Module Resolution...\n');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

console.log('📁 Project root:', projectRoot);
console.log('📁 Monorepo root:', monorepoRoot);
console.log('');

// Critical modules that must be resolvable for EAS builds
const criticalModules = [
  'expo-modules-core',
  'expo',
  '@expo/metro-runtime',
  'react',
  'react-native',
  '@babel/runtime'
];

let allTestsPassed = true;

console.log('🔍 Testing module resolution...\n');

criticalModules.forEach(moduleName => {
  console.log(`Testing: ${moduleName}`);
  
  // Test local resolution first
  const localPath = path.resolve(projectRoot, 'node_modules', moduleName);
  const rootPath = path.resolve(monorepoRoot, 'node_modules', moduleName);
  
  let resolved = false;
  let resolvedPath = '';
  
  if (fs.existsSync(localPath)) {
    resolved = true;
    resolvedPath = localPath;
    console.log(`  ✅ Found in local: ${localPath}`);
  } else if (fs.existsSync(rootPath)) {
    resolved = true;
    resolvedPath = rootPath;
    console.log(`  ✅ Found in root: ${rootPath}`);
  } else {
    console.log(`  ❌ NOT FOUND in either location`);
    allTestsPassed = false;
  }
  
  // Test Node.js require resolution
  if (resolved) {
    try {
      const resolvedModule = require.resolve(moduleName, { paths: [projectRoot, monorepoRoot] });
      console.log(`  ✅ Node.js resolve: ${resolvedModule}`);
    } catch (error) {
      console.log(`  ⚠️  Node.js resolve failed: ${error.message}`);
      // This might be OK for some modules that don't have main entry points
    }
  }
  
  console.log('');
});

// Test Metro configuration
console.log('🏗️  Testing Metro configuration...\n');

try {
  const metroConfigPath = path.resolve(projectRoot, 'metro.config.eas.js');
  if (fs.existsSync(metroConfigPath)) {
    console.log('✅ metro.config.eas.js exists');
    
    // Load and validate Metro config
    const metroConfig = require(metroConfigPath);
    
    if (metroConfig.resolver && metroConfig.resolver.extraNodeModules) {
      console.log('✅ extraNodeModules configured');
      console.log('  Configured modules:', Object.keys(metroConfig.resolver.extraNodeModules));
    } else {
      console.log('⚠️  extraNodeModules not configured');
    }
    
    if (metroConfig.resolver && metroConfig.resolver.alias) {
      console.log('✅ Resolver aliases configured');
      console.log('  Configured aliases:', Object.keys(metroConfig.resolver.alias));
    } else {
      console.log('⚠️  Resolver aliases not configured');
    }
    
    if (metroConfig.resolver && metroConfig.resolver.disableHierarchicalLookup) {
      console.log('✅ Hierarchical lookup disabled (required for pnpm)');
    } else {
      console.log('⚠️  Hierarchical lookup not disabled');
    }
  } else {
    console.log('❌ metro.config.eas.js not found');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Error loading Metro config:', error.message);
  allTestsPassed = false;
}

console.log('');

// Test package.json dependencies
console.log('📦 Testing package.json dependencies...\n');

try {
  const packageJsonPath = path.resolve(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies['expo-modules-core']) {
    console.log('✅ expo-modules-core listed as direct dependency');
    console.log(`  Version: ${packageJson.dependencies['expo-modules-core']}`);
  } else {
    console.log('❌ expo-modules-core NOT listed as direct dependency');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allTestsPassed = false;
}

console.log('');

// Final result
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! EAS Build should work correctly.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: pnpm install');
  console.log('2. Test EAS build: eas build --platform android --profile preview');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED! Please review the issues above.');
  console.log('');
  console.log('Common fixes:');
  console.log('1. Run: pnpm install');
  console.log('2. Ensure expo-modules-core is in dependencies');
  console.log('3. Check Metro configuration');
  process.exit(1);
}
