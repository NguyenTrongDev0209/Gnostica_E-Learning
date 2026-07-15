const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/auth');
const files = [
  'LoginPage.jsx',
  'RegisterPage.jsx',
  'ConfirmPage.jsx',
  'ForgotPassword.jsx',
  'ResetPassword.jsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Imports
  content = content.replace(
    /import AuthSocialLogin from '.\/components\/AuthSocialLogin';\s*/g,
    ''
  );
  content = content.replace(
    /import AuthCard from '.\/components\/AuthCard';\s*/g,
    ''
  );
  
  const uiImports = [];
  if (content.includes('AuthCard')) {
    uiImports.push('import { Card, CardContent } from "@/components/ui/card";');
  }
  if (content.includes('AuthSocialLogin')) {
    uiImports.push('import { Button } from "@/components/ui/button";');
  }
  
  if (uiImports.length > 0) {
    const importMatch = content.match(/import.*?from.*?;\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + uiImports.join('\n') + '\n');
    }
  }

  // 2. AuthSocialLogin
  const authSocialLoginStr = `<div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          className="btn-md w-full gap-2 font-medium bg-white/90 text-foreground hover:bg-white border-border"
          onClick={() => window.location.href = import.meta.env.VITE_OAUTH2_URL}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Tiếp tục với Google</span>
        </Button>
      </div>`;
  content = content.replace(/<AuthSocialLogin \/>/g, authSocialLoginStr);

  // 3. AuthCard
  content = content.replace(/<AuthCard\s+title="([^"]+)"\s+description=\{?((?:(?!>).)*)\}?\s*>/s, (match, title, descriptionStr) => {
    // Check if description is a string or jsx
    let descContent = '';
    let isJsx = descriptionStr.startsWith('<>');
    if (descriptionStr.startsWith('"') && descriptionStr.endsWith('"')) {
      descContent = descriptionStr.slice(1, -1);
    } else if (descriptionStr.startsWith('{`') && descriptionStr.endsWith('`}')) {
      descContent = descriptionStr.slice(2, -2);
    } else if (isJsx) {
      descContent = descriptionStr.slice(2, -2); // remove <> and </>
    } else {
      descContent = descriptionStr; // whatever it is, might need adjustments
    }

    // if string starts with " and ends with "
    if (descContent.startsWith('"') && descContent.endsWith('"')) descContent = descContent.slice(1, -1);

    return `<div className="w-full max-w-[480px]">
      <Card className="shadow-lg border-border bg-white/80 backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">${title}</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
              ${isJsx ? descContent : (descriptionStr.startsWith('{`') ? '{`' + descContent + '`}' : descContent)}
            </p>
          </div>`;
  });

  // the </AuthCard> tag
  content = content.replace(/<\/AuthCard>/g, `        </CardContent>\n      </Card>\n    </div>`);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
