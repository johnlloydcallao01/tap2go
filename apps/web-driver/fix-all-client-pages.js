const fs = require('fs');
const path = require('path');

// Function to find all page.tsx files
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

function ensureProperClientComponent(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Skip if not a client component
    if (!content.includes("'use client'")) {
      return;
    }
    
    // Check if it already has both dynamic and revalidate exports
    const hasDynamic = content.includes('export const dynamic');
    const hasRevalidate = content.includes('export const revalidate');
    
    if (hasDynamic && hasRevalidate) {
      console.log(`✓ ${filePath} already properly configured`);
      return;
    }
    
    const lines = content.split('\n');
    let insertIndex = -1;
    
    // Find where to insert the exports (after 'use client')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("'use client'")) {
        insertIndex = i + 1;
        break;
      }
    }
    
    if (insertIndex === -1) {
      return;
    }
    
    // Add empty line if needed
    if (lines[insertIndex] && lines[insertIndex].trim() !== '') {
      lines.splice(insertIndex, 0, '');
      insertIndex++;
    }
    
    // Add the exports if they don't exist
    const exportsToAdd = [];
    
    if (!hasDynamic) {
      exportsToAdd.push(
        '// Force dynamic rendering to prevent SSR serialization issues',
        'export const dynamic = \'force-dynamic\';'
      );
    }
    
    if (!hasRevalidate) {
      exportsToAdd.push('export const revalidate = 0;');
    }
    
    if (exportsToAdd.length > 0) {
      lines.splice(insertIndex, 0, ...exportsToAdd);
      
      const newContent = lines.join('\n');
      fs.writeFileSync(fullPath, newContent);
      console.log(`✓ Updated ${filePath} with proper exports`);
    }
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Ensuring all client components have proper exports...\n');

const allPageFiles = findAllPageFiles(path.join(__dirname, 'src/app'));

allPageFiles.forEach(ensureProperClientComponent);

console.log('\n✅ All client components updated!');
