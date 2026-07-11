const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else {
      if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
        callback(fullPath);
      }
    }
  });
}

function refactorFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Check if file imports any of the old buttons
  const oldButtons = ['SimpleButton', 'OutlineGradientButton', 'GhostButton', 'CategoryButton'];
  const hasOldButton = oldButtons.some(btn => content.includes(btn));
  
  if (!hasOldButton) return;

  // 2. Fix imports
  // Usually looks like: import { SimpleButton, GhostButton } from "@/components/common/micro/AppButton";
  // We need to ensure AppButton is imported, and remove the old ones.
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/components\/common\/micro\/AppButton['"]/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    let imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
    let newImports = imports.filter(i => !oldButtons.includes(i));
    if (!newImports.includes('AppButton')) {
      newImports.push('AppButton');
    }
    return `import { ${newImports.join(', ')} } from "@/components/common/micro/AppButton"`;
  });

  // 3. Replace tags
  // <SimpleButton ...props> -> <AppButton appVariant="gradient" ...props>
  content = content.replace(/<SimpleButton([^>]*)>/g, '<AppButton appVariant="gradient"$1>');
  content = content.replace(/<\/SimpleButton>/g, '</AppButton>');

  // <OutlineGradientButton ...props> -> <AppButton appVariant="outlineGradient" ...props>
  content = content.replace(/<OutlineGradientButton([^>]*)>/g, '<AppButton appVariant="outlineGradient"$1>');
  content = content.replace(/<\/OutlineGradientButton>/g, '</AppButton>');

  // <GhostButton ...props> -> <AppButton appVariant="ghostMuted" variant="ghost"$1>
  content = content.replace(/<GhostButton([^>]*)>/g, '<AppButton appVariant="ghostMuted" variant="ghost"$1>');
  content = content.replace(/<\/GhostButton>/g, '</AppButton>');

  // <CategoryButton ...props> -> <AppButton appVariant="category" className="text-sm h-10 px-4"$1>
  // Note: active logic won't be perfectly ported if they used it dynamically, but we handle it best effort.
  content = content.replace(/<CategoryButton([^>]*)>/g, '<AppButton appVariant="category" className="text-sm h-10 px-4"$1>');
  content = content.replace(/<\/CategoryButton>/g, '</AppButton>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
}

const srcDir = path.join(__dirname, 'src');
console.log('Starting refactor...');
walk(srcDir, refactorFile);
console.log('Done.');
