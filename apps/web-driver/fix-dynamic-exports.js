const fs = require('fs');
const path = require('path');

// Function to find all component files with incorrect dynamic exports
function findComponentsWithDynamicExport(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.next')) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') && fullPath.includes('components')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('export const dynamic')) {
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

function removeDynamicExport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove the dynamic export and any related comments
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.includes('export const dynamic') && 
             !trimmed.includes('Force dynamic rendering to avoid SSR issues');
    });
    
    // Remove empty lines that might be left behind
    let cleanedLines = [];
    let previousLineEmpty = false;
    
    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      const isEmpty = line.trim() === '';
      
      // Skip multiple consecutive empty lines at the beginning
      if (isEmpty && i < 5 && previousLineEmpty) {
        continue;
      }
      
      cleanedLines.push(line);
      previousLineEmpty = isEmpty;
    }
    
    const newContent = cleanedLines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    console.log(`✓ Removed dynamic export from ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log('Scanning for components with incorrect dynamic exports...\n');

const filesToFix = findComponentsWithDynamicExport(path.join(__dirname, 'src'));

console.log(`Found ${filesToFix.length} component files with incorrect dynamic exports:`);
filesToFix.forEach(file => console.log(`  - ${file}`));
console.log('');

if (filesToFix.length > 0) {
  console.log('Removing incorrect dynamic exports...\n');
  filesToFix.forEach(removeDynamicExport);
  console.log('\n✅ Dynamic export cleanup completed!');
  console.log('\n📝 Note: The "export const dynamic" directive should only be used in page components (page.tsx files), not in regular components.');
} else {
  console.log('✅ No components have incorrect dynamic exports!');
}
