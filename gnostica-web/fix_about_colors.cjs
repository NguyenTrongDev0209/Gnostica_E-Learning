const fs = require('fs');
const path = require('path');

const dir = 'src/pages/general/components/about';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    if (content.includes('bg-neutral-900')) {
        content = content.replace(/bg-neutral-900/g, 'bg-card text-card-foreground');
        modified = true;
    }
    
    if (content.includes('bg-teal-800')) {
        content = content.replace(/bg-teal-800/g, 'bg-primary text-primary-foreground');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Replaced colors in ${file}`);
    }
}
