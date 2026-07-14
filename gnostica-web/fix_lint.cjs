const fs = require('fs');

// Fix PrivacyPage
let privContent = fs.readFileSync('src/pages/general/PrivacyPage.jsx', 'utf8');
privContent = privContent.replace("import React\nimport PageContainer from '@/components/common/core/PageContainer' from \"react\";", "import React from 'react';\nimport PageContainer from '@/components/common/core/PageContainer';");
fs.writeFileSync('src/pages/general/PrivacyPage.jsx', privContent);

// Fix TermsPage
let termsContent = fs.readFileSync('src/pages/general/TermsPage.jsx', 'utf8');
termsContent = termsContent.replace("import React\nimport PageContainer from '@/components/common/core/PageContainer' from \"react\";", "import React from 'react';\nimport PageContainer from '@/components/common/core/PageContainer';");
fs.writeFileSync('src/pages/general/TermsPage.jsx', termsContent);

// Fix UserProfile
let userContent = fs.readFileSync('src/pages/general/UserProfile.jsx', 'utf8');
userContent = userContent.replace(/userData\./g, 'user.');
userContent = userContent.replace(/import authService from '@\/services\/auth\/authService';\n/, '');
userContent = userContent.replace(/import \{[\s\S]*?\} from 'lucide-react';/, match => match.replace(/,\s*Icon/, '')); // if Icon is there

if (!userContent.includes('import React, { useState, useEffect }')) {
    userContent = userContent.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
}

fs.writeFileSync('src/pages/general/UserProfile.jsx', userContent);
console.log('Fixed linting errors');
