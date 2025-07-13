const fs = require('fs');
const path = require('path');

// Account pages that need to be converted to client components
const accountPagesToFix = [
  // These are server components that import client components - need to be fixed
  'src/app/(customer)/account/dashboard/page.tsx',
  'src/app/(customer)/account/addresses/page.tsx',
];

function convertToClientComponent(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already a client component
    if (content.includes("'use client'")) {
      console.log(`✓ ${filePath} is already a client component`);
      return;
    }
    
    // Check if it's a server component importing client components
    const lines = content.split('\n');
    
    // Find the first import line
    let firstImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('type')) {
        firstImportIndex = i;
        break;
      }
    }
    
    if (firstImportIndex === -1) {
      console.log(`⚠️  No imports found in ${filePath}`);
      return;
    }
    
    // Insert 'use client' and dynamic export before first import
    lines.splice(firstImportIndex, 0, 
      "'use client';",
      '',
      '// Force dynamic rendering for interactive account pages',
      'export const dynamic = \'force-dynamic\';',
      ''
    );
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    console.log(`✓ Converted ${filePath} to client component`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Converting account pages to proper client components...\n');

accountPagesToFix.forEach(convertToClientComponent);

console.log('\n✅ Account pages conversion completed!');
