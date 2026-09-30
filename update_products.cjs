const fs = require('fs');

const map = {
    'Madagascar Centella Poremizing Deep Cleansing Foam': 'skin1004-poremizing-foam.jpeg',
    'Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++': 'skin1004-sun.jpeg',
    'Pore + Dark Spot Brightening Pad': 'celimax-pad.jpeg',
    'The Vita A Retinol Shot Tightening Serum': 'celimax-retinol.jpeg',
    'Dual Barrier Skin Wearable Cream': 'celimax-barrier.jpeg',
    'One Day Exosome Shot Pore Serum 2000': 'medicube-exosome.jpeg',
    'Collagen Night Wrapping Mask': 'medicube-mask.jpeg',
    'Triple Collagen Serum 4.0': 'medicube-serum.jpeg',
    'Deep Vita C Pad': 'medicube-vitac.jpeg',
    'Zero Pore Pad 2.0': 'medicube-pore.jpeg',
    'Madagascar Centella Light Cleansing Oil': 'skin1004-cleansing.jpeg',
    'Collagen Niacinamide Jelly Cream': 'medicube-jelly.jpeg',
    'Madagascar Centella Ampoule Foam': 'skin1004-ampoule-foam.jpeg',
    'Daily Tinted Fluid Sunscreen SPF 40 LP110': 'boj-tinted-sunscreen.jpeg',
    '345 Relief Cream': 'dr-althea-345.jpeg',
    'The Vita-A Retinal Shot Tightening Booster': 'celimax-retinal.jpeg',
    'Revive Eye Serum: Ginseng + Retinal': 'boj-eye-serum.jpeg',
    'Azelaic Acid 10 Hyaluron Redness Soothing Serum': 'anua-azelaic.jpeg',
    'Madagascar Centella Toning Toner': 'skin1004-toner.jpeg',
    'TXA Niacinamide 15% Serum': 'medicube-txa-serum.jpeg',
    'Vitamin C Boosting Serum': 'dr-althea-vit-c.jpeg',
    'Madagascar Centella Probio-Cica Bakuchiol Eye Cream': 'skin1004-probio-cica-eye.jpeg',
    'PDRN Pink Collagen Capsule Cream': 'medicube-pdrn-capsule.jpeg'
};

let content = fs.readFileSync('app/products.ts', 'utf-8');

for (const [name, filename] of Object.entries(map)) {
    // Instead of Regex, we can use simple string matching and index based replacement
    const nameIndex = content.indexOf(`name: "${name}"`);
    if (nameIndex !== -1) {
        const imageIndex = content.indexOf(`image: "`, nameIndex);
        if (imageIndex !== -1) {
            const endQuoteIndex = content.indexOf(`"`, imageIndex + 8);
            if (endQuoteIndex !== -1) {
                const before = content.substring(0, imageIndex + 8);
                const after = content.substring(endQuoteIndex);
                content = before + `/products-edited/${filename}` + after;
            }
        }
    }
}

fs.writeFileSync('app/products.ts', content);
console.log('Updated app/products.ts');
