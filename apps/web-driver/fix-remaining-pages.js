const fs = require('fs');
const path = require('path');

// Pages that need the revalidate fix
const pagesToFix = [
  'src/app/driver/settings/page.tsx',
  'src/app/admin/reports/users/page.tsx',
  'src/app/(customer)/account/help/page.tsx'
];

function addRevalidateExport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if revalidate export already exists
    if (content.includes('export const revalidate')) {
      console.log(`✓ ${filePath} already has revalidate export`);
      return;
    }
    
    // Find the line with dynamic export
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export const dynamic')) {
        insertIndex = i + 1;
        break;
      }
    }
    
    if (insertIndex === -1) {
      // If no dynamic export found, add both after 'use client'
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("'use client'")) {
          insertIndex = i + 1;
          // Add empty line if needed
          if (lines[insertIndex] && lines[insertIndex].trim() !== '') {
            lines.splice(insertIndex, 0, '');
            insertIndex++;
          }
          // Add both exports
          lines.splice(insertIndex, 0, 
            '// Force dynamic rendering to avoid SSR issues',
            'export const dynamic = \'force-dynamic\';',
            'export const revalidate = 0;'
          );
          break;
        }
      }
    } else {
      // Add revalidate export after dynamic export
      lines.splice(insertIndex, 0, 'export const revalidate = 0;');
    }
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    console.log(`✓ Added revalidate export to ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Adding revalidate exports to remaining problematic pages...\n');

pagesToFix.forEach(addRevalidateExport);

console.log('\n✅ Revalidate export fix completed!');
