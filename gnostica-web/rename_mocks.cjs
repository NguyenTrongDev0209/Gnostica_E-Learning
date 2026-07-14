const fs = require('fs');
const path = require('path');

// 1. Rename directory
const oldPath = path.join(__dirname, 'src', 'apiMocks');
const newPath = path.join(__dirname, 'src', 'mocks');

if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Renamed src/apiMocks to src/mocks');
} else {
    console.log('Directory src/apiMocks not found (maybe already renamed)');
}

// 2. Search and replace in all .js, .jsx files in src
function walkSync(dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
}

const allFiles = walkSync(path.join(__dirname, 'src'));
let replacedCount = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/apiMocks/')) {
        content = content.replace(/@\/apiMocks\//g, '@/mocks/');
        fs.writeFileSync(file, content);
        replacedCount++;
        console.log(`Updated imports in ${file}`);
    }
}

console.log(`Finished replacing in ${replacedCount} files.`);
