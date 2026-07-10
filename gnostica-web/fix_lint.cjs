const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/instructor/**/*.jsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace imports
  content = content.replace(/import\s*\{\s*useFormContext,\s*useWatch,\s*useFieldArray\s*\}\s*from\s*['"]react-hook-form['"];\n?/g, '');
  content = content.replace(/import\s*\{\s*toast\s*\}\s*from\s*['"]sonner['"];\n?/g, '');
  content = content.replace(/import\s*courseService\s*from\s*['"]@\/services\/course\/courseService['"];\n?/g, '');
  content = content.replace(/import\s*\{\s*useParams\s*\}\s*from\s*['"]react-router-dom['"];\n?/g, '');
  
  fs.writeFileSync(file, content);
});

console.log("Done fixing simple unused imports.");
