const fs = require('fs');
const dict = {'ropida':'rápida', 'comedog?nico':'comedogénico', 'Despu?s':'Después', 'algodn':'algodón', 's?rum':'sérum'};
function fixFile(file) { let content = fs.readFileSync(file, 'utf-8'); for (const [bad, good] of Object.entries(dict)) { content = content.split(bad).join(good); } fs.writeFileSync(file, content, 'utf-8'); }
fixFile('app/products.ts'); fixFile('app/page.tsx');
