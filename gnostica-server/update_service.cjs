const fs = require('fs');
let c = fs.readFileSync('src/main/java/com/gnostica/modules/user/service/impl/AdminUserDetailServiceImpl.java', 'utf8');

c = c.replace(/l\.getStatus\(\) == 2/g, 'l.getStatus().equals("Completed")');
c = c.replace(/t\.getName\(\)/g, 't.getTitle()');

fs.writeFileSync('src/main/java/com/gnostica/modules/user/service/impl/AdminUserDetailServiceImpl.java', c);
console.log('Fixed service errors');
