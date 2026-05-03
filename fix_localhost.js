const fs = require('fs');
const path = require('path');

const SEARCH = 'http://localhost:5000/';
const REPLACE = '/';

const DIRS = [
  path.join(__dirname, 'frontend', 'src'),
  path.join(__dirname, 'admin', 'src'),
];

const EXTENSIONS = ['.tsx', '.ts', '.js'];

let totalFiles = 0;
let modifiedFiles = 0;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      totalFiles++;
      const original = fs.readFileSync(fullPath, 'utf8');
      if (original.includes(SEARCH)) {
        const updated = original.split(SEARCH).join(REPLACE);
        fs.writeFileSync(fullPath, updated, 'utf8');
        modifiedFiles++;
        console.log(`✅ Fixed: ${fullPath}`);
      }
    }
  }
}

for (const dir of DIRS) {
  processDir(dir);
}

console.log(`\n🎉 Done! ${modifiedFiles} files modified out of ${totalFiles} scanned.`);
