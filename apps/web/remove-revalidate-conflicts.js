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

function removeRevalidateExport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if revalidate export exists
    if (!content.includes('export const revalidate')) {
      return;
    }
    
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      return !line.includes('export const revalidate');
    });
    
    const newContent = filteredLines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    console.log(`✓ Removed revalidate export from ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Removing conflicting revalidate exports...\n');

const allPageFiles = findAllPageFiles(path.join(__dirname, 'src/app'));

allPageFiles.forEach(removeRevalidateExport);

console.log('\n✅ All revalidate exports removed!');
