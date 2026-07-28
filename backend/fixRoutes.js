const fs = require('fs');
const files = [
  'routes/uploadRoutes.js',
  'routes/productRoutes.js',
  'routes/orderRoutes.js',
  'routes/imageRoutes.js',
  'routes/couponRoutes.js',
  'routes/categoryRoutes.js'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/const \{ protect, admin \} = require\(['"]\.\.\/middleware\/authMiddleware['"]\);/g, 'const { protect, authorize } = require("../middleware/authMiddleware");');
  c = c.replace(/, admin,/g, ', authorize("admin"),');
  c = c.replace(/\(admin,/g, '(authorize("admin"),');
  c = c.replace(/router\.use\(admin\);/g, 'router.use(authorize("admin"));');
  fs.writeFileSync(f, c);
});
console.log('Fixed admin middleware imports');
