const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:', 'Gnostica_E-Learning', 'gnostica-web', 'src');

const moves = [
  // home
  ['pages/client/HomePage.jsx', 'pages/home/HomePage.jsx'],
  
  // course
  ['pages/client/CourseCatalog.jsx', 'pages/course/CourseCatalog.jsx'],
  ['pages/client/CourseCategory.jsx', 'pages/course/CourseCategory.jsx'],
  ['pages/client/CourseDetail.jsx', 'pages/course/CourseDetail.jsx'],
  ['pages/client/SearchPage.jsx', 'pages/course/SearchPage.jsx'],
  
  // order
  ['pages/client/CourseCart.jsx', 'pages/order/CourseCart.jsx'],
  ['pages/client/CheckoutPage.jsx', 'pages/order/CheckoutPage.jsx'],
  ['pages/client/CheckoutResult.jsx', 'pages/order/CheckoutResult.jsx'],
  ['pages/client/PayosQR.jsx', 'pages/order/PayosQR.jsx'],
  
  // forum
  ['pages/client/ForumPage.jsx', 'pages/forum/ForumPage.jsx'],
  ['pages/client/ForumDetail.jsx', 'pages/forum/ForumDetail.jsx'],
  ['pages/client/ForumCreatePost.jsx', 'pages/forum/ForumCreatePost.jsx'],
  ['pages/client/MyForumPosts.jsx', 'pages/forum/MyForumPosts.jsx'],
  
  // user
  ['pages/client/UserProfile.jsx', 'pages/user/UserProfile.jsx'],
  ['pages/client/InstructorList.jsx', 'pages/user/InstructorList.jsx'],
  ['pages/client/ApplyInstructor.jsx', 'pages/user/ApplyInstructor.jsx'],
  
  // static
  ['pages/client/AboutUs.jsx', 'pages/static/AboutUs.jsx'],
  ['pages/client/TermsPage.jsx', 'pages/static/TermsPage.jsx'],
  ['pages/client/PrivacyPage.jsx', 'pages/static/PrivacyPage.jsx'],
  
  // refactoring subcomponents
  ['pages/admin/AdminCategories.jsx', 'pages/admin/components/AdminCategories.jsx'],
  ['pages/admin/AdminForumCategory.jsx', 'pages/admin/components/AdminForumCategory.jsx'],
  ['pages/instructor/WithdrawModal.jsx', 'pages/instructor/components/WithdrawModal.jsx']
];

// Moving contents of component folders
const componentMoves = [
  ['pages/client/components/home', 'pages/home/components'], // we move contents, so we don't end up with home/components/home
  ['pages/client/components/shared', 'pages/course/components/shared'],
  ['pages/client/components/courseDetail', 'pages/course/components/courseDetail'],
  ['pages/client/components/checkout', 'pages/order/components/checkout'],
  ['pages/client/components/about', 'pages/static/components/about']
];

// Helper to move file
function moveFile(srcRel, destRel) {
  const src = path.join(srcDir, srcRel);
  const dest = path.join(srcDir, destRel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    console.log(`Moved file: ${srcRel} -> ${destRel}`);
  } else {
    console.log(`Source file not found: ${srcRel}`);
  }
}

// Helper to move folder contents to dest (or just rename if dest is empty or non-existent)
function moveDir(srcRel, destRel) {
  const src = path.join(srcDir, srcRel);
  const dest = path.join(srcDir, destRel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const itemSrc = path.join(src, item);
        const itemDest = path.join(dest, item);
        fs.cpSync(itemSrc, itemDest, { recursive: true });
    });
    fs.rmSync(src, { recursive: true, force: true });
    console.log(`Moved dir: ${srcRel} -> ${destRel}`);
  } else {
    console.log(`Source dir not found: ${srcRel}`);
  }
}

moves.forEach(m => moveFile(m[0], m[1]));
componentMoves.forEach(m => moveDir(m[0], m[1]));

console.log("File movements completed.");
