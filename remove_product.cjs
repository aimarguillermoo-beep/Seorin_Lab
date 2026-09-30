const fs = require('fs');
let content = fs.readFileSync('app/products.ts', 'utf-8');

// Find the block from { brand: "SKIN1004", name: "Madagascar Centella Tone Brightening Capsule Ampoule" up to the next },
const startIndex = content.indexOf('  {\r\n    brand: "SKIN1004",\r\n    name: "Madagascar Centella Tone Brightening Capsule Ampoule",');
if (startIndex !== -1) {
    const endIndex = content.indexOf('  },', startIndex);
    if (endIndex !== -1) {
        content = content.substring(0, startIndex) + content.substring(endIndex + 6);
        fs.writeFileSync('app/products.ts', content);
        console.log('Removed product.');
    } else {
        console.log('Could not find end of block.');
    }
} else {
    // Try with \n instead of \r\n
    const startIndex2 = content.indexOf('  {\n    brand: "SKIN1004",\n    name: "Madagascar Centella Tone Brightening Capsule Ampoule",');
    if (startIndex2 !== -1) {
        const endIndex2 = content.indexOf('  },', startIndex2);
        if (endIndex2 !== -1) {
            content = content.substring(0, startIndex2) + content.substring(endIndex2 + 5);
            fs.writeFileSync('app/products.ts', content);
            console.log('Removed product (LF).');
        }
    } else {
        console.log('Product not found.');
    }
}
