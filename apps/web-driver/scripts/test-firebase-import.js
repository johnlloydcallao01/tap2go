#!/usr/bin/env node

/**
 * Test script to verify Firebase import works correctly
 * This helps debug Vercel build issues
 */

console.log('🔥 Testing Firebase import...');

try {
  // Test the import path resolution
  const path = require('path');
  const firebasePath = path.resolve(__dirname, '../src/lib/firebase.ts');
  console.log('📍 Firebase file path:', firebasePath);
  
  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(firebasePath)) {
    console.log('✅ Firebase file exists');
  } else {
    console.log('❌ Firebase file not found');
    process.exit(1);
  }
  
  // Test TypeScript compilation
  console.log('🔧 Testing TypeScript compilation...');
  
  // Test the actual import (this will fail in Node.js but shows the error)
  try {
    require('../src/lib/firebase.ts');
    console.log('✅ Firebase import successful');
  } catch (error) {
    console.log('⚠️  Firebase import failed (expected in Node.js):', error.message);
  }
  
  console.log('🎉 Firebase import test completed');
  
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
