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
console.log('📍 Current working directory:', process.cwd());
console.log('📍 Script directory:', __dirname);

// Determine the correct base directory
const baseDir = process.cwd().includes('apps/web-driver')
  ? process.cwd()
  : path.resolve(__dirname, '..');

console.log('📍 Base directory:', baseDir);

// Verify critical files exist
const criticalFiles = [
  'src/lib/firebase.ts',
  'src/lib/firebase-admin.ts',
  'src/lib/database/users.ts',
  'src/contexts/AuthContext.tsx'
];

console.log('📋 Verifying critical files...');
for (const file of criticalFiles) {
  const filePath = path.resolve(baseDir, file);
  console.log(`🔍 Checking: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Critical file missing: ${file}`);
    console.error(`   Expected at: ${filePath}`);

    // Try alternative paths for debugging
    const altPath1 = path.resolve(process.cwd(), file);
    const altPath2 = path.resolve(__dirname, '..', file);
    console.log(`🔍 Alternative path 1: ${altPath1} - exists: ${fs.existsSync(altPath1)}`);
    console.log(`🔍 Alternative path 2: ${altPath2} - exists: ${fs.existsSync(altPath2)}`);

    // List directory contents for debugging
    const srcDir = path.resolve(baseDir, 'src');
    if (fs.existsSync(srcDir)) {
      console.log(`📁 Contents of ${srcDir}:`, fs.readdirSync(srcDir));
      const libDir = path.resolve(srcDir, 'lib');
      if (fs.existsSync(libDir)) {
        console.log(`📁 Contents of ${libDir}:`, fs.readdirSync(libDir));
      }
    }

    process.exit(1);
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Verify TypeScript configuration
const tsconfigPath = path.resolve(baseDir, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('❌ tsconfig.json not found at:', tsconfigPath);
  process.exit(1);
}

const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
if (!tsconfig.compilerOptions.paths || !tsconfig.compilerOptions.paths['@/*']) {
  console.error('❌ TypeScript path mapping not configured');
  process.exit(1);
}

console.log('✅ TypeScript configuration verified');

// Verify Next.js configuration
const nextConfigPath = path.resolve(baseDir, 'next.config.ts');
if (!fs.existsSync(nextConfigPath)) {
  console.error('❌ next.config.ts not found at:', nextConfigPath);
  process.exit(1);
}

console.log('✅ Next.js configuration verified');

// Set Vercel-specific environment variables
process.env.VERCEL = '1';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_ENV_VALIDATION = '1';

console.log('🎯 Environment variables set for Vercel build');

// Verify node_modules structure
const nodeModulesPath = path.resolve(baseDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.warn('⚠️ Local node_modules not found, checking workspace root...');
  const workspaceNodeModules = path.resolve(baseDir, '../../node_modules');
  if (!fs.existsSync(workspaceNodeModules)) {
    console.error('❌ No node_modules found');
    process.exit(1);
  } else {
    console.log('✅ Workspace node_modules found');
  }
} else {
  console.log('✅ Local node_modules found');
}

console.log('✅ Dependencies verified');

console.log('🎉 Vercel build preparation completed successfully!');
console.log('📦 Ready for Next.js build...');
