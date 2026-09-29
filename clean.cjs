const fs = require('fs');
function cleanFile(f) { let c = fs.readFileSync(f, 'utf-8'); c = c.replace(/Ǹ/g, 'é').replace(/ǭ/g, 'á').replace(/áácido/g, 'ácido').replace(/rǭpida/g, 'rápida').replace(/r\u01EDpida/g, 'rápida').replace(/s\u01F8rum/g, 'sérum').replace(/\u01F8/g, 'é'); fs.writeFileSync(f, c, 'utf-8'); }
cleanFile('app/products.ts'); cleanFile('app/page.tsx');
