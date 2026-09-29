const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

const newCatalogNames = [
  'Madagascar Centella Poremizing Deep Cleansing Foam',
  'Madagascar Centella Ampoule Foam',
  'Daily Tinted Fluid Sunscreen SPF 40 LP110',
  '345 Relief Cream',
  'The Vita-A Retinal Shot Tightening Booster',
  'Revive Eye Serum: Ginseng + Retinal',
  'Azelaic Acid 10 Hyaluron Redness Soothing Serum',
  'Madagascar Centella Toning Toner'
];
content = content.replace(/const catalogNames = \\[[\\s\\S]*?\\];/, (match) => {
  return match.replace('];', newCatalogNames.map(n => '  "' + n + '",').join('\\n') + '\\n];');
});

const newNeeds = {
  'Madagascar Centella Poremizing Deep Cleansing Foam': ['Acné, poros y textura'],
  'Madagascar Centella Ampoule Foam': ['Piel seca y deshidratada', 'Barrera sensible'],
  'Daily Tinted Fluid Sunscreen SPF 40 LP110': ['Protección solar', 'Manchas y tono desigual'],
  '345 Relief Cream': ['Barrera sensible', 'Piel seca y deshidratada', 'Manchas y tono desigual'],
  'The Vita-A Retinal Shot Tightening Booster': ['Líneas de expresión y firmeza', 'Acné, poros y textura'],
  'Revive Eye Serum: Ginseng + Retinal': ['Líneas de expresión y firmeza', 'Piel seca y deshidratada', 'Luminosidad'],
  'Azelaic Acid 10 Hyaluron Redness Soothing Serum': ['Acné, poros y textura', 'Manchas y tono desigual', 'Barrera sensible'],
  'Madagascar Centella Toning Toner': ['Acné, poros y textura', 'Luminosidad']
};
let needsString = '';
for(const [k, v] of Object.entries(newNeeds)) {
  needsString += '  "' + k + '": ' + JSON.stringify(v).replace(/é/g, '\u00e9').replace(/í/g, '\u00ed').replace(/ó/g, '\u00f3') + ',\\n';
}
content = content.replace(/const needMap: Record<string, string\\[\\]> = \\{[\\s\\S]*?\\};/, (match) => {
  return match.replace('};', needsString + '};');
});

const newTypes = {
  'Madagascar Centella Poremizing Deep Cleansing Foam': 'Limpiador',
  'Madagascar Centella Ampoule Foam': 'Limpiador',
  'Daily Tinted Fluid Sunscreen SPF 40 LP110': 'Protector solar',
  '345 Relief Cream': 'Crema hidratante',
  'The Vita-A Retinal Shot Tightening Booster': 'Tratamiento / Booster',
  'Revive Eye Serum: Ginseng + Retinal': 'Contorno de ojos',
  'Azelaic Acid 10 Hyaluron Redness Soothing Serum': 'Sérum / Ampoule',
  'Madagascar Centella Toning Toner': 'Tónico'
};
let typesString = '';
for(const [k, v] of Object.entries(newTypes)) {
  typesString += '  "' + k + '": "' + v.replace(/é/g, '\u00e9').replace(/ó/g, '\u00f3') + '",\\n';
}
content = content.replace(/const typeMap: Record<string, string> = \\{[\\s\\S]*?\\};/, (match) => {
  return match.replace('};', typesString + '};');
});

content = content.replace('<option>MEDICUBE</option><option>SKIN1004</option><option>CELIMAX</option>', '<option>MEDICUBE</option><option>SKIN1004</option><option>CELIMAX</option><option>BEAUTY OF JOSEON</option><option>DR. ALTHEA</option><option>ANUA</option>');
content = content.replace('["Limpiador","Sérum / Ampoule","Crema hidratante","Pads","Mascarilla","Protector solar","Kit / Rutina"]', '["Limpiador","Sérum / Ampoule","Crema hidratante","Pads","Mascarilla","Protector solar","Kit / Rutina","Contorno de ojos","Tónico","Tratamiento / Booster"]');

content = content.replace(
  /...cartEntries.map\\(\\(\\{product, quantity\\}\\) => \\.*?c\\/u\\\\)/,
  \...cartEntries.map(({product, quantity}) => \\\\\u2022 \ x \\ \u2014 \ c/u\\\)\
);

fs.writeFileSync('app/page.tsx', content);
