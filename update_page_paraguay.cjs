const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Fix Button text in ProductCard
content = content.replace(
  /{product.soldOut \? "Sin stock" : product.preorder \? "Reservar en preventa" : "Agregar al pedido"}/g,
  '{product.soldOut ? "Sin stock" : "Agregar al pedido"}'
);

// 2. Add the 4 new items to catalogNames
const newCatalogNames = [
  "TXA Niacinamide 15% Serum",
  "Vitamin C Boosting Serum",
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream",
  "PDRN Pink Collagen Capsule Cream"
];

// Find catalogNames array end and insert
content = content.replace(/const catalogNames = \[[^\]]+\];/, (match) => {
  return match.replace('];', newCatalogNames.map(n => '  "' + n + '",').join('\n') + '\n];');
});

// 3. Update needMap
const newNeeds = {
  "TXA Niacinamide 15% Serum": ["Manchas y tono desigual", "Luminosidad"],
  "Vitamin C Boosting Serum": ["Manchas y tono desigual", "Luminosidad"],
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream": ["Líneas de expresión y firmeza", "Piel seca y deshidratada"],
  "PDRN Pink Collagen Capsule Cream": ["Piel seca y deshidratada", "Luminosidad", "Líneas de expresión y firmeza"]
};
let needsString = '';
for(const [k, v] of Object.entries(newNeeds)) {
  needsString += '  "' + k + '": ' + JSON.stringify(v) + ',\n';
}
content = content.replace(/const needMap: Record<string, string\[\]> = \{[^\}]+?\};/, (match) => {
  return match.replace('};', needsString + '};');
});

// 4. Update typeMap
const newTypes = {
  "TXA Niacinamide 15% Serum": "Sérum / Ampoule",
  "Vitamin C Boosting Serum": "Sérum / Ampoule",
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream": "Contorno de ojos",
  "PDRN Pink Collagen Capsule Cream": "Crema"
};
let typesString = '';
for(const [k, v] of Object.entries(newTypes)) {
  typesString += '  "' + k + '": "' + v + '",\n';
}
content = content.replace(/const typeMap: Record<string, string> = \{[^\}]+?\};/, (match) => {
  return match.replace('};', typesString + '};');
});

fs.writeFileSync('app/page.tsx', content, 'utf-8');
