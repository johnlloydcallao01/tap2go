#!/usr/bin/env node

/**
 * Test script to verify scheduler module can be resolved correctly
 * This specifically tests the scheduler module resolution for React Native
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing scheduler module resolution...');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Test scheduler module paths
const schedulerPaths = [
  path.resolve(monorepoRoot, 'node_modules/scheduler'),
  path.resolve(monorepoRoot, 'node_modules/scheduler/index.js'),
  path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js'),
  path.resolve(monorepoRoot, 'node_modules/scheduler/cjs/scheduler.native.production.js'),
  path.resolve(monorepoRoot, 'node_modules/scheduler/cjs/scheduler.native.development.js'),
];

let allResolved = true;

console.log('\n📦 Checking scheduler module files:');

schedulerPaths.forEach(schedulerPath => {
  const exists = fs.existsSync(schedulerPath);
  const relativePath = path.relative(monorepoRoot, schedulerPath);
  
  if (exists) {
    console.log(`✅ ${relativePath}: EXISTS`);
  } else {
    console.log(`❌ ${relativePath}: NOT FOUND`);
    allResolved = false;
  }
});

// Test Metro config scheduler resolution
console.log('\n🔧 Testing Metro config scheduler resolution:');
try {
  // Force reload the config
  delete require.cache[require.resolve('./metro.config.eas.js')];
  const metroConfig = require('./metro.config.eas.js');
  
  // Check extraNodeModules
  if (metroConfig.resolver && metroConfig.resolver.extraNodeModules && metroConfig.resolver.extraNodeModules.scheduler) {
    const schedulerPath = metroConfig.resolver.extraNodeModules.scheduler;
    const exists = fs.existsSync(schedulerPath);
    console.log(`✅ extraNodeModules scheduler: ${exists ? 'CONFIGURED' : 'PATH NOT FOUND'}`);
    if (!exists) allResolved = false;
  } else {
    console.log('❌ extraNodeModules scheduler: NOT CONFIGURED');
    allResolved = false;
  }
  
  // Check alias
  if (metroConfig.resolver && metroConfig.resolver.alias && metroConfig.resolver.alias.scheduler) {
    const schedulerPath = metroConfig.resolver.alias.scheduler;
    const exists = fs.existsSync(schedulerPath);
    console.log(`✅ alias scheduler: ${exists ? 'CONFIGURED' : 'PATH NOT FOUND'}`);
    if (!exists) allResolved = false;
  } else {
    console.log('❌ alias scheduler: NOT CONFIGURED');
    allResolved = false;
  }
  
  // Check custom resolver
  if (metroConfig.resolver && metroConfig.resolver.resolveRequest) {
    console.log('✅ Custom resolver: CONFIGURED');
  } else {
    console.log('❌ Custom resolver: NOT CONFIGURED');
    allResolved = false;
  }
  
} catch (error) {
  console.log(`❌ Metro config error: ${error.message}`);
  allResolved = false;
}

// Test require resolution
console.log('\n🧪 Testing require resolution:');
try {
  // Test native scheduler resolution
  const nativeSchedulerPath = path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js');
  const nativeScheduler = require(nativeSchedulerPath);
  console.log('✅ scheduler/index.native.js: CAN BE REQUIRED');
  
  // Check if it has expected exports
  if (typeof nativeScheduler.unstable_scheduleCallback === 'function') {
    console.log('✅ scheduler exports: VALID (has unstable_scheduleCallback)');
  } else {
    console.log('❌ scheduler exports: INVALID (missing unstable_scheduleCallback)');
    allResolved = false;
  }
  
} catch (error) {
  console.log(`❌ scheduler require error: ${error.message}`);
  allResolved = false;
}

console.log('\n' + '='.repeat(50));
if (allResolved) {
  console.log('🎉 All scheduler resolution tests PASSED!');
  console.log('✅ scheduler module is properly configured for EAS Build');
  process.exit(0);
} else {
  console.log('❌ Some scheduler resolution tests FAILED!');
  console.log('🔧 Please fix the issues above before running EAS Build');
  process.exit(1);
}
