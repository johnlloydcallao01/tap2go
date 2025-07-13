const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/TSX files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix React 19 component type issues
function fixReact19Types(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Skip if file already imports our types
  if (content.includes('@/types/components')) {
    return false;
  }

  // Check if file uses Heroicons and has component type issues
  const hasHeroicons = content.includes('@heroicons/react');
  const hasComponentTypes = content.includes('React.ComponentType<{ className?: string }>') || 
                           content.includes('ComponentType<{ className?: string }>');

  if (hasHeroicons && hasComponentTypes) {
    // Add import for our types
    const importMatch = content.match(/import.*from '@heroicons\/react\/24\/outline';/);
    if (importMatch) {
      const importLine = importMatch[0];
      const newImport = importLine + '\nimport { asIconComponent } from \'@/types/components\';';
      content = content.replace(importLine, newImport);
      modified = true;
    }

    // Replace component type definitions
    content = content.replace(
      /React\.ComponentType<\{ className\?: string \}>/g,
      'import("@/types/components").IconComponent'
    );
    content = content.replace(
      /ComponentType<\{ className\?: string \}>/g,
      'import("@/types/components").IconComponent'
    );

    // Wrap icon assignments with asIconComponent
    const iconPattern = /icon:\s*([A-Z][a-zA-Z]*Icon)/g;
    content = content.replace(iconPattern, 'icon: asIconComponent($1)');
    
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = findTsxFiles(srcDir);

let fixedCount = 0;
files.forEach(file => {
  if (fixReact19Types(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files with React 19 type issues.`);
