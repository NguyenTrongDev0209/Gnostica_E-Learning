const fs = require('fs');
let content = fs.readFileSync('src/pages/general/InstructorList.jsx', 'utf8');

// Color fixes
content = content.replace(/via-slate-900/g, 'via-background');
content = content.replace(/to-slate-900/g, 'to-background');
content = content.replace(/to-orange-400/g, 'to-warning');
content = content.replace(/text-slate-300/g, 'text-muted-foreground');
content = content.replace(/from-slate-100/g, 'from-muted');
content = content.replace(/to-slate-200\/50/g, 'to-muted/50');
content = content.replace(/to-orange-50/g, 'to-warning-soft');

fs.writeFileSync('src/pages/general/InstructorList.jsx', content);
console.log('Success replacing colors in InstructorList.jsx');
