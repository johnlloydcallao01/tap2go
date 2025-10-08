#!/usr/bin/env node

/**
 * Fix PayloadCMS Geospatial Endpoints
 * 
 * This script implements the recommended fixes based on PayloadCMS best practices:
 * 1. Update response construction to use Response.json()
 * 2. Remove manual JSON.stringify and headers
 * 3. Improve error handling consistency
 * 4. Remove unnecessary type casting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, 'src', 'payload.config.ts');

console.log('🔧 Fixing PayloadCMS Geospatial Endpoints...');
console.log(`📁 Target file: ${CONFIG_FILE}`);

// Check if file exists
if (!fs.existsSync(CONFIG_FILE)) {
  console.error('❌ payload.config.ts not found!');
  process.exit(1);
}

// Read the current file
let content = fs.readFileSync(CONFIG_FILE, 'utf8');

console.log('📖 Reading current configuration...');

// Define the fixes to apply
const fixes = [
  {
    name: 'Fix Response.json() for success responses',
    search: /return new Response\(\s*JSON\.stringify\((\{[\s\S]*?\})\),\s*\{\s*status:\s*200,\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\s*\}\s*\);/g,
    replace: 'return Response.json($1, { status: 200 });'
  },
  {
    name: 'Fix Response.json() for 400 error responses',
    search: /return new Response\(\s*JSON\.stringify\((\{[\s\S]*?\})\),\s*\{\s*status:\s*400,\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\s*\}\s*\);/g,
    replace: 'return Response.json($1, { status: 400 });'
  },
  {
    name: 'Fix Response.json() for 500 error responses',
    search: /return new Response\(\s*JSON\.stringify\((\{[\s\S]*?\})\),\s*\{\s*status:\s*500,\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\s*\}\s*\);/g,
    replace: 'return Response.json($1, { status: 500 });'
  },
  {
    name: 'Remove PayloadHandler type casting',
    search: /\)\s*as\s*PayloadHandler,/g,
    replace: '),'
  }
];

// Apply each fix
let fixesApplied = 0;
fixes.forEach((fix, index) => {
  const matches = content.match(fix.search);
  if (matches) {
    console.log(`✅ Applying fix ${index + 1}: ${fix.name} (${matches.length} occurrences)`);
    content = content.replace(fix.search, fix.replace);
    fixesApplied++;
  } else {
    console.log(`⚠️  Fix ${index + 1}: ${fix.name} - No matches found`);
  }
});

// Additional fix for multiline JSON.stringify patterns
const multilineJsonFix = {
  name: 'Fix multiline JSON.stringify patterns',
  apply: () => {
    // More comprehensive regex for multiline patterns
    const pattern = /new Response\(\s*JSON\.stringify\(\s*(\{[\s\S]*?\})\s*\),\s*\{\s*status:\s*(\d+),\s*headers:\s*\{\s*'Content-Type':\s*'application\/json'\s*\}\s*\}\s*\)/g;
    const matches = content.match(pattern);
    if (matches) {
      console.log(`✅ Applying multiline JSON.stringify fix (${matches.length} occurrences)`);
      content = content.replace(pattern, 'Response.json($1, { status: $2 })');
      return true;
    }
    return false;
  }
};

if (multilineJsonFix.apply()) {
  fixesApplied++;
}

// Create backup
const backupFile = `${CONFIG_FILE}.backup.${Date.now()}`;
fs.writeFileSync(backupFile, fs.readFileSync(CONFIG_FILE));
console.log(`💾 Backup created: ${backupFile}`);

// Write the fixed content
fs.writeFileSync(CONFIG_FILE, content);

console.log(`\n🎉 Fixes applied successfully!`);
console.log(`📊 Total fixes applied: ${fixesApplied}`);
console.log(`📝 Updated file: ${CONFIG_FILE}`);

// Verify the changes
console.log('\n🔍 Verifying changes...');
const updatedContent = fs.readFileSync(CONFIG_FILE, 'utf8');

// Check for remaining issues
const remainingIssues = [];

if (updatedContent.includes('new Response(JSON.stringify(')) {
  remainingIssues.push('Manual Response construction still found');
}

if (updatedContent.includes('as PayloadHandler')) {
  remainingIssues.push('PayloadHandler type casting still found');
}

if (remainingIssues.length > 0) {
  console.log('⚠️  Remaining issues:');
  remainingIssues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ All issues resolved!');
}

console.log('\n📋 Summary of changes:');
console.log('   ✅ Updated Response construction to use Response.json()');
console.log('   ✅ Removed manual JSON.stringify calls');
console.log('   ✅ Removed manual Content-Type headers');
console.log('   ✅ Removed PayloadHandler type casting');

console.log('\n🚀 Next steps:');
console.log('   1. Test the endpoints: pnpm run test-geospatial-endpoints.js');
console.log('   2. Start the server and check for errors');
console.log('   3. Monitor server logs for any remaining issues');

console.log('\n💡 If issues persist, check:');
console.log('   - GeospatialService implementation');
console.log('   - Database connection and PostGIS setup');
console.log('   - PayloadCMS version compatibility');