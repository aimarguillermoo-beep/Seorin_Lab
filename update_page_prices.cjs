const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf-8');

c = c.replace(
  /<div className="current-product-price-block">[\s\S]*?<\/div>/,
  `<div className="current-product-price-block">
          <div className="price-secondary-group">
            <span className="price-list">{formatPrice(product.price)}</span>
            <span className="price-cuotas">3 cuotas sin interés de {formatPrice(cuota)}</span>
          </div>
          <div className="price-transfer-group">
            <span className="transfer-badge">15% OFF por transferencia</span>
            <strong className="transfer-price">{formatPrice(transfer)}</strong>
          </div>
        </div>`
);

fs.writeFileSync('app/page.tsx', c, 'utf-8');
