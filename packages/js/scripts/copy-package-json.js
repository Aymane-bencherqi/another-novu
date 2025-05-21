const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

copyFile(path.join(__dirname, '../package.cjs.json'), path.join(__dirname, '../dist/cjs/package.json'));
copyFile(path.join(__dirname, '../package.esm.json'), path.join(__dirname, '../dist/esm/package.json'));
