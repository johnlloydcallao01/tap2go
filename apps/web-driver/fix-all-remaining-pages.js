const fs = require('fs');
const path = require('path');

// Function to find all page.tsx files that need the revalidate fix
function findAllPageFiles(dir) {
  const pageFiles = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
        scanDirectory(fullPath);
      } else if (item === 'page.tsx') {
        pageFiles.push(path.relative(__dirname, fullPath).replace(/\\/g, '/'));
      }
    }
  }
  
  scanDirectory(dir);
  return pageFiles;
}

function addRevalidateExport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if it's a client component
    if (!content.includes("'use client'")) {
      console.log(`⚠️  Skipping ${filePath} (not a client component)`);
      return;
    }
    
    // Check if revalidate export already exists
    if (content.includes('export const revalidate')) {
      console.log(`✓ ${filePath} already has revalidate export`);
      return;
    }
    
    const lines = content.split('\n');
    let insertIndex = -1;
    
    // Find the line with dynamic export
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

console.log('Scanning for all page.tsx files...\n');

const allPageFiles = findAllPageFiles(path.join(__dirname, 'src/app'));

console.log(`Found ${allPageFiles.length} page files. Processing client components...\n`);

allPageFiles.forEach(addRevalidateExport);

console.log('\n✅ All page files processed!');
