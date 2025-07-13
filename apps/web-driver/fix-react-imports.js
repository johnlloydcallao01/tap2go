const fs = require('fs');
const path = require('path');

// Function to find all TSX files that need React imports
function findFilesNeedingReactImport(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const hasReactImport = content.includes('import React') || content.includes('import * as React');
          const hasJSX = /<\w+/.test(content);

          if (!hasReactImport && hasJSX) {
            files.push(path.relative(__dirname, fullPath).replace(/\\/g, '/'));
          }
        } catch (error) {
          console.error(`Error reading ${fullPath}:`, error.message);
        }
      }
    }
  }

  scanDirectory(dir);
  return files;
}

const filesToFix = findFilesNeedingReactImport(path.join(__dirname, 'src'));

function addReactImport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if React import already exists
    if (content.includes('import React')) {
      console.log(`✓ ${filePath} already has React import`);
      return;
    }
    
    // Find the line after 'use client' and dynamic export
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export const dynamic')) {
        insertIndex = i + 1;
        break;
      } else if (lines[i].includes("'use client'")) {
        insertIndex = i + 1;
        // Look for empty line or dynamic export
        while (insertIndex < lines.length && (lines[insertIndex].trim() === '' || lines[insertIndex].includes('export const dynamic'))) {
          insertIndex++;
        }
        break;
      }
    }
    
    // Insert React import
    lines.splice(insertIndex, 0, '', "import React from 'react';");
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    console.log(`✓ Added React import to ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Scanning for files that need React imports...\n');
console.log(`Found ${filesToFix.length} files that need React imports:`);
filesToFix.forEach(file => console.log(`  - ${file}`));
console.log('');

if (filesToFix.length > 0) {
  console.log('Adding React imports...\n');
  filesToFix.forEach(addReactImport);
  console.log('\n✅ React import fix completed!');
} else {
  console.log('✅ No files need React imports!');
}
