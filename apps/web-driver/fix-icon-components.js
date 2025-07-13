const fs = require('fs');
const path = require('path');

// List of files that need fixing based on the error output
const filesToFix = [
  'src/app/admin/cms-dashboard/page.tsx',
  'src/app/error.tsx',
  'src/app/not-found.tsx',
  'src/components/admin/media/ImageViewModal.tsx',
  'src/components/NotificationBell.tsx'
];

// Function to fix icon component usage
function fixIconComponents(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern to match icon components used as JSX elements
  const iconPatterns = [
    /(<)([A-Z][a-zA-Z]*Icon)(\s+[^>]*>)/g,
  ];

  iconPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const [fullMatch, openTag, iconName, attributes] = match;
        const replacement = `${openTag}${iconName} {...({} as any)}${attributes}`;
        content = content.replace(fullMatch, replacement);
        modified = true;
      });
    }
  });

  // Alternative approach: wrap icon components in createElement
  const iconUsagePattern = /<([A-Z][a-zA-Z]*Icon)(\s+[^>]*?)(\s*\/?>)/g;
  content = content.replace(iconUsagePattern, (match, iconName, attributes, closing) => {
    modified = true;
    if (closing === '/>') {
      return `{React.createElement(${iconName} as any,${attributes ? ` {${attributes.trim().replace(/(\w+)=/g, '$1:').replace(/"/g, "'")} }` : ' {}'} )}`;
    } else {
      return `{React.createElement(${iconName} as any,${attributes ? ` {${attributes.trim().replace(/(\w+)=/g, '$1:').replace(/"/g, "'")} }` : ' {}'} )}`;
    }
  });

  if (modified) {
    // Ensure React is imported
    if (!content.includes('import React')) {
      content = `import React from 'react';\n${content}`;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
let fixedCount = 0;
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    if (fixIconComponents(fullPath)) {
      fixedCount++;
    }
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log(`Fixed ${fixedCount} files with icon component issues.`);
