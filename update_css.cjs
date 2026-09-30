const fs = require('fs');
let content = fs.readFileSync('app/globals.css', 'utf-8');

content = content.replace(/\.transfer-price \{\s*font-size:\s*20px;/g, '.transfer-price {\n  font-size: 18px;');
content = content.replace(/\.transfer-price \{\s*font-size:\s*17px;/g, '.transfer-price {\n    font-size: 15px;');

fs.writeFileSync('app/globals.css', content);
