#!/usr/bin/env node

/**
 * Simple test to verify scheduler module resolution
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Simple scheduler resolution test...');

const monorepoRoot = path.resolve(__dirname, '../..');

// Test the exact path we configured
const schedulerNativePath = path.resolve(monorepoRoot, 'node_modules/scheduler/index.native.js');

console.log(`📍 Testing path: ${schedulerNativePath}`);

if (fs.existsSync(schedulerNativePath)) {
  console.log('✅ scheduler/index.native.js file exists');
  
  try {
    const scheduler = require(schedulerNativePath);
    console.log('✅ scheduler/index.native.js can be required');
    
    if (typeof scheduler.unstable_scheduleCallback === 'function') {
      console.log('✅ scheduler has expected exports');
      console.log('🎉 Scheduler resolution test PASSED!');
      console.log('✅ Ready for EAS Build with scheduler fix');
    } else {
      console.log('❌ scheduler missing expected exports');
    }
  } catch (error) {
    console.log(`❌ Error requiring scheduler: ${error.message}`);
  }
} else {
  console.log('❌ scheduler/index.native.js file does not exist');
}
