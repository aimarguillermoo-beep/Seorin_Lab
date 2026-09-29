const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf-8');

const desktopOld = \.current-product-price { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 15px; border-top: 1px solid var(--line); }
.current-product-price strong { font-size: 19px; }
.current-product-price span { font-size: 11px; font-weight: 700; }\;

const desktopNew = \.current-product-price-block { margin-top: auto; padding-top: 15px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px; }
.current-product-price-block strong.price-list { font-size: 19px; color: var(--ink); font-weight: 700; }
.current-product-price-block span.price-cuotas { font-size: 12px; font-weight: 500; color: #5f5550; }
.current-product-price-block span.price-transfer { font-size: 12px; font-weight: 500; color: #416751; margin-top: 2px; }
.current-product-price-block span.price-transfer strong { font-size: 14px; font-weight: 700; }
.stock-badge.preorder { background: #5f6e63; }\;

const mobileOld = \  .current-product-price { padding-top: 10px; gap: 6px; }
  .current-product-price strong { font-size: 15px; }
  .current-product-price span { font-size: 9px; }\;

const mobileNew = \  .current-product-price-block { padding-top: 10px; gap: 2px; }
  .current-product-price-block strong.price-list { font-size: 15px; }
  .current-product-price-block span.price-cuotas { font-size: 10px; }
  .current-product-price-block span.price-transfer { font-size: 11px; }
  .current-product-price-block span.price-transfer strong { font-size: 12px; }\;

css = css.replace(desktopOld, desktopNew);
css = css.replace(mobileOld, mobileNew);

fs.writeFileSync('app/globals.css', css);
