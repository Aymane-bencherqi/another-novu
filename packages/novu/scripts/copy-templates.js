const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.join(__dirname, '../src/commands/init/templates');
const destDir = path.join(__dirname, '../dist/src/commands/init/templates');

// Copy app templates
const appSrc = path.join(srcDir, 'app');
const appDest = path.join(destDir, 'app');
copyDir(appSrc, appDest);

// Copy app-react-email templates
const appReactEmailSrc = path.join(srcDir, 'app-react-email');
const appReactEmailDest = path.join(destDir, 'app-react-email');
copyDir(appReactEmailSrc, appReactEmailDest);

// Copy github templates
const githubSrc = path.join(srcDir, 'github');
const githubDest = path.join(destDir, 'github');
copyDir(githubSrc, githubDest);
