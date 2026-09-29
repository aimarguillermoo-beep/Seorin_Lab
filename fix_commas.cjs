const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf-8');
c = c.replace(/"Madagascar Centella Toning Toner"\r?\n"TXA/g, '"Madagascar Centella Toning Toner",\n"TXA');
c = c.replace(/"Luminosidad"\]\r?\n"TXA/g, '"Luminosidad"],\n"TXA');
c = c.replace(/"Tónico"\r?\n"TXA/g, '"Tónico",\n"TXA');
fs.writeFileSync('app/page.tsx', c, 'utf-8');
