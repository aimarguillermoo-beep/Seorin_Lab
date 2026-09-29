const fs = require('fs');
let lines = fs.readFileSync('app/page.tsx', 'utf-8').split('\n');
lines[131] = '  const orderLink = whatsappLink(["Hola Seorin Lab. Quiero hacer este pedido:", "", ...cartEntries.map(({product, quantity}) => \• \ x \\ — \ c/u\), "", \Total base: \\, "¿Me confirmás stock, pago y envío?"].join("\\n"));';
fs.writeFileSync('app/page.tsx', lines.join('\n'));
