const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/baseline-browser-mapping/dist/index.cjs');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const index = content.indexOf('over two months old');
  if (index !== -1) {
    const start = Math.max(0, index - 1000);
    const end = Math.min(content.length, index + 300);
    console.log(content.substring(start, end));
  }
} catch (err) {
  console.error(err);
}
