const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/cms-dashboard/page.tsx');

function fixRemainingIcons() {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // List of remaining icon replacements needed
  const iconReplacements = [
    { pattern: /<DocumentTextIcon className="([^"]*)"(\s*\/>|\s*><\/DocumentTextIcon>)/g, replacement: '{React.createElement(DocumentTextIcon as any, { className: "$1" })}' },
    { pattern: /<ArrowPathIcon className="([^"]*)"(\s*\/>|\s*><\/ArrowPathIcon>)/g, replacement: '{React.createElement(ArrowPathIcon as any, { className: "$1" })}' },
    { pattern: /<TagIcon className="([^"]*)"(\s*\/>|\s*><\/TagIcon>)/g, replacement: '{React.createElement(TagIcon as any, { className: "$1" })}' },
    { pattern: /<ChartBarIcon className="([^"]*)"(\s*\/>|\s*><\/ChartBarIcon>)/g, replacement: '{React.createElement(ChartBarIcon as any, { className: "$1" })}' },
    { pattern: /<ArrowUturnLeftIcon className="([^"]*)"(\s*\/>|\s*><\/ArrowUturnLeftIcon>)/g, replacement: '{React.createElement(ArrowUturnLeftIcon as any, { className: "$1" })}' }
  ];

  let modified = false;
  
  iconReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed remaining icons in cms-dashboard page');
    return true;
  }

  return false;
}

// Execute the fix
if (fixRemainingIcons()) {
  console.log('Successfully fixed remaining icons');
} else {
  console.log('No remaining icons to fix');
}
