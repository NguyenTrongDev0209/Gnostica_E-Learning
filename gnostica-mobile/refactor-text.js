const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appTextPath = path.join(__dirname, 'src', 'components', 'ui', 'AppText.jsx');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.jsx') || f.endsWith('.tsx')) {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    if (filePath === appTextPath) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove all existing AppText imports to clean up the bad placement
    const badImportRegex = /import AppText from ['"][^'"]+AppText['"];?\n?/g;
    const hasAppTextBefore = badImportRegex.test(content);
    if (hasAppTextBefore) {
        content = content.replace(badImportRegex, '');
    }

    // Check if the file still has <AppText (meaning it was refactored)
    if (!/<AppText(\s|>|\/)/.test(content) && !/<\/AppText>/.test(content)) {
        return; // nothing to do
    }

    // Add import AppText to the absolute top of the file (after imports like React if needed, but top is fine)
    const relativeToSrc = path.relative(path.dirname(filePath), path.dirname(appTextPath));
    let importPath = relativeToSrc.split(path.sep).join('/');
    if (!importPath.startsWith('.')) {
        importPath = './' + importPath;
    }
    importPath = importPath === './' ? './AppText' : importPath + '/AppText';

    // Put it at the top, but after 'use client' or 'use strict' if present. 
    // Just prepend it to the start of the file for simplicity.
    content = `import AppText from '${importPath}';\n` + content;

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
}

walkDir(srcDir, processFile);
console.log('Done fixing!');
