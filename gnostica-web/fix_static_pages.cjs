const fs = require('fs');

const files = [
    'src/pages/general/ErrorPage.jsx',
    'src/pages/general/PrivacyPage.jsx',
    'src/pages/general/TermsPage.jsx',
    'src/pages/general/AboutUs.jsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        let modified = false;
        
        if (content.includes('bg-white')) {
            content = content.replace(/bg-white/g, 'bg-card text-card-foreground');
            modified = true;
        }
        
        if (content.includes('from-white')) {
            content = content.replace(/from-white/g, 'from-background');
            modified = true;
        }
        
        // Also check PageContainer for Privacy and Terms
        if (file.includes('PrivacyPage') || file.includes('TermsPage')) {
            if (!content.includes('PageContainer')) {
                content = content.replace("import React", "import React\nimport PageContainer from '@/components/common/core/PageContainer'");
                content = content.replace('<div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">', '<PageContainer className="py-12 px-4 sm:px-6 lg:px-8">');
                content = content.replace('</div>\n    );\n};\n\nexport default', '</PageContainer>\n    );\n};\n\nexport default');
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    }
}
