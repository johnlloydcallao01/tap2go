#!/usr/bin/env node

/**
 * Vercel Build Script for web-driver
 * 
 * This script ensures proper module resolution and dependency handling
 * for Vercel deployments in monorepo environments.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build preparation...');

// Verify critical files exist
const criticalFiles = [
  'src/lib/firebase.ts',
  'src/lib/firebase-admin.ts',
  'src/lib/database/users.ts',
  'src/contexts/AuthContext.tsx'
];

console.log('📋 Verifying critical files...');
for (const file of criticalFiles) {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Critical file missing: ${file}`);
    process.exit(1);
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Verify TypeScript configuration
const tsconfigPath = path.resolve(__dirname, '..', 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('❌ tsconfig.json not found');
  process.exit(1);
}

const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
if (!tsconfig.compilerOptions.paths || !tsconfig.compilerOptions.paths['@/*']) {
  console.error('❌ TypeScript path mapping not configured');
  process.exit(1);
}

console.log('✅ TypeScript configuration verified');

// Verify Next.js configuration
const nextConfigPath = path.resolve(__dirname, '..', 'next.config.ts');
if (!fs.existsSync(nextConfigPath)) {
  console.error('❌ next.config.ts not found');
  process.exit(1);
}

console.log('✅ Next.js configuration verified');

// Set Vercel-specific environment variables
process.env.VERCEL = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_ENV_VALIDATION = '1';

console.log('🎯 Environment variables set for Vercel build');

// Verify node_modules structure
const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found');
  process.exit(1);
}

console.log('✅ Dependencies verified');

console.log('🎉 Vercel build preparation completed successfully!');
console.log('📦 Ready for Next.js build...');
