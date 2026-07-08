const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src');

const replacements = {
  '@/pages/client/HomePage': '@/pages/home/HomePage',
  '@/pages/client/CourseCatalog': '@/pages/course/CourseCatalog',
  '@/pages/client/CourseCategory': '@/pages/course/CourseCategory',
  '@/pages/client/CourseDetail': '@/pages/course/CourseDetail',
  '@/pages/client/SearchPage': '@/pages/course/SearchPage',
  '@/pages/client/CourseCart': '@/pages/order/CourseCart',
  '@/pages/client/CheckoutPage': '@/pages/order/CheckoutPage',
  '@/pages/client/CheckoutResult': '@/pages/order/CheckoutResult',
  '@/pages/client/PayosQR': '@/pages/order/PayosQR',
  '@/pages/client/ForumPage': '@/pages/forum/ForumPage',
  '@/pages/client/ForumDetail': '@/pages/forum/ForumDetail',
  '@/pages/client/ForumCreatePost': '@/pages/forum/ForumCreatePost',
  '@/pages/client/MyForumPosts': '@/pages/forum/MyForumPosts',
  '@/pages/client/UserProfile': '@/pages/user/UserProfile',
  '@/pages/client/InstructorList': '@/pages/user/InstructorList',
  '@/pages/client/ApplyInstructor': '@/pages/user/ApplyInstructor',
  '@/pages/client/AboutUs': '@/pages/static/AboutUs',
  '@/pages/client/TermsPage': '@/pages/static/TermsPage',
  '@/pages/client/PrivacyPage': '@/pages/static/PrivacyPage',
  
  // Components
  '@/pages/client/components/home': '@/pages/home/components',
  '@/pages/client/components/shared': '@/pages/course/components/shared',
  '@/pages/client/components/courseDetail': '@/pages/course/components/courseDetail',
  '@/pages/client/components/checkout': '@/pages/order/components/checkout',
  '@/pages/client/components/about': '@/pages/static/components/about',

  // Admin & Instructor components
  '@/pages/admin/AdminCategories': '@/pages/admin/components/AdminCategories',
  '@/pages/admin/AdminForumCategory': '@/pages/admin/components/AdminForumCategory',
  '@/pages/instructor/WithdrawModal': '@/pages/instructor/components/WithdrawModal'
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [oldImport, newImport] of Object.entries(replacements)) {
    // Replace all occurrences of oldImport. We use a global regex.
    // Escape string for regex
    const escapedOld = oldImport.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedOld, 'g');
    content = content.replace(regex, newImport);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
}

processDirectory(srcDir);
console.log('Import replacements completed.');
