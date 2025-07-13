const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/cms-dashboard/page.tsx');

function fixCmsDashboard() {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // List of all icon replacements needed based on the error output
  const iconReplacements = [
    { pattern: /<ArrowPathIcon className="([^"]*)"(\s*\/>|\s*><\/ArrowPathIcon>)/g, replacement: '{React.createElement(ArrowPathIcon as any, { className: "$1" })}' },
    { pattern: /<ExclamationTriangleIcon className="([^"]*)"(\s*\/>|\s*><\/ExclamationTriangleIcon>)/g, replacement: '{React.createElement(ExclamationTriangleIcon as any, { className: "$1" })}' },
    { pattern: /<CheckCircleIcon className="([^"]*)"(\s*\/>|\s*><\/CheckCircleIcon>)/g, replacement: '{React.createElement(CheckCircleIcon as any, { className: "$1" })}' },
    { pattern: /<XCircleIcon className="([^"]*)"(\s*\/>|\s*><\/XCircleIcon>)/g, replacement: '{React.createElement(XCircleIcon as any, { className: "$1" })}' },
    { pattern: /<PlusIcon className="([^"]*)"(\s*\/>|\s*><\/PlusIcon>)/g, replacement: '{React.createElement(PlusIcon as any, { className: "$1" })}' },
    { pattern: /<PencilIcon className="([^"]*)"(\s*\/>|\s*><\/PencilIcon>)/g, replacement: '{React.createElement(PencilIcon as any, { className: "$1" })}' },
    { pattern: /<FolderIcon className="([^"]*)"(\s*\/>|\s*><\/FolderIcon>)/g, replacement: '{React.createElement(FolderIcon as any, { className: "$1" })}' },
    { pattern: /<EyeIcon className="([^"]*)"(\s*\/>|\s*><\/EyeIcon>)/g, replacement: '{React.createElement(EyeIcon as any, { className: "$1" })}' },
    { pattern: /<TrashIcon className="([^"]*)"(\s*\/>|\s*><\/TrashIcon>)/g, replacement: '{React.createElement(TrashIcon as any, { className: "$1" })}' }
  ];

  let modified = false;
  
  iconReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    // Ensure React is imported
    if (!content.includes('import React')) {
      content = `import React from 'react';\n${content}`;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed cms-dashboard page');
    return true;
  }

  return false;
}

// Execute the fix
if (fixCmsDashboard()) {
  console.log('Successfully fixed cms-dashboard page');
} else {
  console.log('No changes needed for cms-dashboard page');
}
