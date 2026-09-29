const fs = require('fs');
function cleanFile(f) { let c = fs.readFileSync(f, 'utf-8'); c = c.replace(/Acnéé/g, 'Acné'); fs.writeFileSync(f, c, 'utf-8'); }
cleanFile('app/products.ts'); cleanFile('app/page.tsx');
