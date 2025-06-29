#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the monorepo root (same logic as metro.config.js)
const projectRoot = __dirname;
const monorepoRoot = projectRoot; // The script is run from the monorepo root

console.log('🔍 VERIFYING RESOLVED BUNDLE JAVASCRIPT MODULES');
console.log('='.repeat(60));
console.log(`📁 Project root: ${projectRoot}`);
console.log(`📁 Monorepo root: ${monorepoRoot}`);
console.log('');

// List of all previously resolved modules
const resolvedModules = [
  'expo-modules-core',
  'react-native-is-edge-to-edge', 
  '@react-native/virtualized-lists',
  'memoize-one',
  'whatwg-url-without-unicode',
  'use-sync-external-store',
  'use-latest-callback',
  '@react-navigation/routers',
  'ansi-regex',
  '@react-native/normalize-colors',
  'react-is',
  'query-string',
  'nanoid',
  'escape-string-regexp',
  '@react-navigation/elements',
  'buffer',
  '@react-native/assets-registry',
  'base64-js',
  'stacktrace-parser',
  'css-mediaquery',
  'webidl-conversions',
  'decode-uri-component',
  'ieee754',
  'filter-obj',
  'split-on-first',
  'color',
  'color-string',
  '@babel/runtime',
  'scheduler'
];

let totalModules = resolvedModules.length;
let foundModules = 0;
let missingModules = [];

console.log('📦 CHECKING MODULE EXISTENCE:');
console.log('-'.repeat(60));

resolvedModules.forEach((moduleName, index) => {
  const moduleNumber = (index + 1).toString().padStart(2, '0');
  let modulePath;
  
  // Special handling for scheduler (uses native version)
  if (moduleName === 'scheduler') {
    modulePath = path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js');
  } else {
    modulePath = path.resolve(monorepoRoot, 'node_modules', moduleName);
  }
  
  const exists = fs.existsSync(modulePath);
  const status = exists ? '✅' : '❌';
  const statusText = exists ? 'FOUND' : 'MISSING';
  
  console.log(`${moduleNumber}. ${status} ${moduleName.padEnd(35)} ${statusText}`);
  
  if (exists) {
    foundModules++;
  } else {
    missingModules.push(moduleName);
  }
});

console.log('');
console.log('📊 SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ Found modules: ${foundModules}/${totalModules}`);
console.log(`❌ Missing modules: ${missingModules.length}/${totalModules}`);

if (missingModules.length > 0) {
  console.log('');
  console.log('⚠️  MISSING MODULES:');
  missingModules.forEach(module => {
    console.log(`   - ${module}`);
  });
}

console.log('');
console.log('🔍 CHECKING @babel/runtime HELPERS:');
console.log('-'.repeat(60));

const babelRuntimeHelpersDir = path.resolve(monorepoRoot, 'node_modules/@babel/runtime/helpers');
if (fs.existsSync(babelRuntimeHelpersDir)) {
  const helperFiles = fs.readdirSync(babelRuntimeHelpersDir);
  const jsHelpers = helperFiles.filter(file => file.endsWith('.js') && file !== 'esm');
  
  console.log(`✅ @babel/runtime/helpers directory found`);
  console.log(`✅ ${jsHelpers.length} helper files available`);
  
  // Check for the specific helper that was causing issues
  const interopRequireDefault = path.resolve(babelRuntimeHelpersDir, 'interopRequireDefault.js');
  const interopExists = fs.existsSync(interopRequireDefault);
  console.log(`${interopExists ? '✅' : '❌'} interopRequireDefault.js: ${interopExists ? 'FOUND' : 'MISSING'}`);
  
} else {
  console.log('❌ @babel/runtime/helpers directory not found');
}

console.log('');
console.log('🎯 METRO CONFIG VERIFICATION:');
console.log('-'.repeat(60));

const metroConfigPath = path.resolve(projectRoot, 'apps/mobile-customer/metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  console.log('✅ metro.config.js found');
  
  const metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
  
  // Check if our modules are in the config
  let configuredModules = 0;
  resolvedModules.forEach(moduleName => {
    if (metroConfig.includes(`'${moduleName}'`) || metroConfig.includes(`"${moduleName}"`)) {
      configuredModules++;
    }
  });
  
  console.log(`✅ ${configuredModules}/${totalModules} modules found in metro.config.js`);
  
  // Check for key features
  const hasExtraNodeModules = metroConfig.includes('extraNodeModules');
  const hasBabelRuntimeMappings = metroConfig.includes('babelRuntimeMappings');
  const hasCustomResolver = metroConfig.includes('resolveRequest');
  const hasWatchFolders = metroConfig.includes('watchFolders');
  
  console.log(`${hasExtraNodeModules ? '✅' : '❌'} extraNodeModules configuration`);
  console.log(`${hasBabelRuntimeMappings ? '✅' : '❌'} Dynamic @babel/runtime mappings`);
  console.log(`${hasCustomResolver ? '✅' : '❌'} Custom resolver function`);
  console.log(`${hasWatchFolders ? '✅' : '❌'} Watch folders configuration`);
  
} else {
  console.log('❌ metro.config.js not found');
}

console.log('');
console.log('🚀 CONCLUSION:');
console.log('='.repeat(60));

if (foundModules === totalModules) {
  console.log('🎉 ALL RESOLVED MODULES ARE PRESERVED AND AVAILABLE!');
  console.log('✅ Your Bundle JavaScript progress is intact');
  console.log('✅ Ready for next EAS build when quota resets');
} else {
  console.log('⚠️  Some modules may need attention');
  console.log(`📊 Progress: ${foundModules}/${totalModules} modules available`);
}
