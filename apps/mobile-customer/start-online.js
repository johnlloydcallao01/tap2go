#!/usr/bin/env node

/**
 * Online Expo Starter Script
 * Starts Expo in full online mode with network connectivity
 */

const { spawn } = require('child_process');

console.log('🌐 Starting Expo in ONLINE mode...');
console.log('📡 Network connectivity: ENABLED');
console.log('🔄 Caching: ENABLED for better performance');
console.log('📱 Expo Go compatibility: FULL');

// Set environment variables for online mode
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.EXPO_USE_FAST_RESOLVER = 'true';

// Remove any offline mode variables
delete process.env.EXPO_NO_CACHE;
delete process.env.EXPO_OFFLINE;
delete process.env.METRO_CACHE;

console.log('🚀 Launching Expo CLI...');

// Get command line arguments
const args = process.argv.slice(2);

// Start Expo with online configuration
const expo = spawn('npx', ['expo', 'start', '--clear', ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

expo.on('close', (code) => {
  process.exit(code);
});

expo.on('error', (error) => {
  console.error('❌ Failed to start Expo:', error.message);
  process.exit(1);
});
