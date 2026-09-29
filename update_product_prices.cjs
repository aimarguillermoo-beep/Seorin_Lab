const fs = require('fs');
let c = fs.readFileSync('app/products.ts', 'utf-8');

c = c.replace(/name: "Madagascar Centella Watergel Sheet Ampoule Mask",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 7900,');
});

c = c.replace(/name: "Revive Eye Serum: Ginseng \+ Retinal",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 46900,');
});

c = c.replace(/name: "Madagascar Centella Toning Toner",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 49900,');
});

c = c.replace(/name: "TXA Niacinamide 15% Serum",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 54900,');
});

c = c.replace(/name: "Madagascar Centella Light Cleansing Oil",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 49900,');
});

c = c.replace(/name: "Madagascar Centella Probio-Cica Bakuchiol Eye Cream",[\s\S]*?price: \d+,/g, (match) => {
  return match.replace(/price: \d+,/, 'price: 49900,');
});

fs.writeFileSync('app/products.ts', c, 'utf-8');
