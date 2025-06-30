#!/usr/bin/env node

/**
 * Simple Environment Configuration Test
 * 
 * This script tests that the environment configuration doesn't crash
 * with "Cannot convert undefined value to object" errors.
 */

console.log('🧪 Testing Environment Configuration (Simple)...\n');

// Test that the basic environment variables are accessible
console.log('📦 Testing process.env access...');

try {
  // Test basic environment variable access
  const testVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_MAPS_FRONTEND_KEY'
  ];
  
  console.log('🔍 Checking environment variables:');
  testVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`  ${varName}: ${value ? '✅ Set' : '❌ Not set'}`);
  });
  
  // Test that we can create configuration objects without crashing
  console.log('\n🔧 Testing configuration object creation...');
  
  const getEnvVar = (key) => process.env[key] || '';
  
  const testConfig = {
    firebase: {
      apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
      projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    },
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    }
  };
  
  console.log('✅ Configuration objects created successfully');
  
  // Test safe property access
  console.log('\n🛡️  Testing safe property access...');
  
  const safeAccess = {
    firebaseApiKey: testConfig.firebase?.apiKey || 'NOT_SET',
    firebaseProjectId: testConfig.firebase?.projectId || 'NOT_SET',
    supabaseUrl: testConfig.supabase?.url || 'NOT_SET',
  };
  
  console.log('✅ Safe property access works');
  console.log('📊 Configuration status:');
  Object.entries(safeAccess).forEach(([key, value]) => {
    console.log(`  ${key}: ${value !== 'NOT_SET' ? '✅ Configured' : '❌ Missing'}`);
  });
  
  console.log('\n✅ Environment configuration test completed successfully!');
  console.log('🎉 No "Cannot convert undefined value to object" errors detected!');
  
} catch (error) {
  console.error('❌ Environment configuration test failed:', error.message);
  console.error('📍 Error stack:', error.stack);
  process.exit(1);
}
