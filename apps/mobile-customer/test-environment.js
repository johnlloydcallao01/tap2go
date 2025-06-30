#!/usr/bin/env node

/**
 * Test Environment Configuration
 * 
 * This script tests the environment configuration to ensure it doesn't crash
 * with "Cannot convert undefined value to object" errors.
 */

console.log('🧪 Testing Environment Configuration...\n');

try {
  console.log('📦 Loading environment configuration...');
  const { validateEnvironment } = require('./src/config/environment');
  
  console.log('✅ Environment module loaded successfully');
  
  console.log('🔧 Running validation...');
  const result = validateEnvironment();
  
  console.log('✅ Environment validation completed');
  console.log('📊 Result:', result.isValid ? 'PASSED' : 'FAILED');
  
  if (!result.isValid) {
    console.log('⚠️  Validation errors:');
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n✅ Environment configuration test completed successfully!');
  console.log('🎉 The "Cannot convert undefined value to object" error has been fixed!');
  
} catch (error) {
  console.error('❌ Environment configuration test failed:', error.message);
  console.error('📍 Error stack:', error.stack);
  process.exit(1);
}
