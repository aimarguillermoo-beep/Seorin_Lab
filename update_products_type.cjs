const fs = require('fs');
let content = fs.readFileSync('app/products.ts', 'utf-8');
content = content.replace('brand: "SKIN1004" | "CELIMAX" | "MEDICUBE";', 'brand: "SKIN1004" | "CELIMAX" | "MEDICUBE" | "BEAUTY OF JOSEON" | "DR. ALTHEA" | "ANUA";');
content = content.replace('soldOut?: boolean;\r\n};', 'soldOut?: boolean;\n  preorder?: boolean;\n};');
content = content.replace('soldOut?: boolean;\n};', 'soldOut?: boolean;\n  preorder?: boolean;\n};');
fs.writeFileSync('app/products.ts', content);
