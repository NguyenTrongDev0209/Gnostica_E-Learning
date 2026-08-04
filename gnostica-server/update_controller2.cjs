const fs = require('fs');
let c = fs.readFileSync('src/main/java/com/gnostica/modules/user/controller/AdminUserDetailController.java', 'utf8');

c = c.replace(/ApiResponse\.builder\(\)\.data\((.*?)\)\.build\(\)/g, (match, inner) => {
    // wait, JS replace can't parse nested parens easily, I'll just use simple substring replacement.
    return match;
});

// A much safer way: 
c = c.split('ApiResponse.builder().data(').join('ApiResponse.success(');
// Now we have `ApiResponse.success(adminUserDetailService.getUserSummary(userId)).build()`
// We just need to replace `).build()` with `)` at the end of lines.
c = c.replace(/\)\.build\(\)\);/g, '));');

fs.writeFileSync('src/main/java/com/gnostica/modules/user/controller/AdminUserDetailController.java', c);
console.log('Fixed controller');
