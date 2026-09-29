const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf-8');

const newCSS = `
.current-product-price-block {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 14px; /* Space between secondary group and transfer group */
}
.price-secondary-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.price-secondary-group .price-list {
  font-size: 15px;
  color: var(--ink);
  font-weight: 500;
}
.price-secondary-group .price-cuotas {
  font-size: 11px;
  font-weight: 400;
  color: #5f5550;
}
.price-transfer-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.transfer-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 6px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: #416751;
  background: transparent;
}
.transfer-price {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  line-height: 1;
}

@media (max-width: 768px) {
  .current-product-price-block {
    padding-top: 10px;
    gap: 10px;
  }
  .price-secondary-group .price-list {
    font-size: 13px;
  }
  .price-secondary-group .price-cuotas {
    font-size: 10px;
  }
  .transfer-badge {
    font-size: 8px;
    padding: 2px 4px;
  }
  .transfer-price {
    font-size: 17px;
  }
}
`;

css = css.replace(/\.current-product-price-block \{[\s\S]*?span\.price-transfer strong \{[^\}]+\}/g, newCSS);
css = css.replace(/  \.current-product-price-block \{ padding-top: 10px; gap: 2px; \}\r?\n  \.current-product-price-block strong\.price-list \{ font-size: 15px; \}\r?\n  \.current-product-price-block span\.price-cuotas \{ font-size: 10px; \}\r?\n  \.current-product-price-block span\.price-transfer \{ font-size: 11px; \}\r?\n  \.current-product-price-block span\.price-transfer strong \{ font-size: 12px; \}/g, '');

fs.writeFileSync('app/globals.css', css, 'utf-8');
