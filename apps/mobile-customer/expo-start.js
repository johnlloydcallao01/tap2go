#!/usr/bin/env node

/**
 * Universal Expo Starter Script
 * Fixes the "Body is unusable: Body has already been read" error
 * Works on Windows, macOS, and Linux
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// AGGRESSIVE CACHE CLEARING
console.log('🧹 Clearing Expo cache...');

// Clear Expo cache directory
const os = require('os');
const expoDir = path.join(os.homedir(), '.expo');
if (fs.existsSync(expoDir)) {
  try {
    fs.rmSync(expoDir, { recursive: true, force: true });
    console.log('✅ Cleared ~/.expo directory');
  } catch (error) {
    console.log('⚠️ Could not clear ~/.expo directory:', error.message);
  }
}

// Set multiple environment variables to ENABLE caching for better performance
process.env.EXPO_CACHE = '1';
process.env.EXPO_BETA = 'false';
process.env.EXPO_NO_DOTENV = '1';
process.env.EXPO_NO_TELEMETRY = '1';

console.log('🚀 Starting Expo with CACHING ENABLED for better performance...');
console.log('📝 Environment variables set:');
console.log('   EXPO_CACHE=1');
console.log('   EXPO_BETA=false');
console.log('   EXPO_NO_DOTENV=1');
console.log('   EXPO_NO_TELEMETRY=1');

// Get command line arguments (everything after 'node expo-start.js')
const args = process.argv.slice(2);

// Start Expo with the provided arguments
const expo = spawn('npx', ['expo', 'start', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

expo.on('close', (code) => {
  process.exit(code);
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error);
  process.exit(1);
});
