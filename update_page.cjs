const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

// 1. Update catalogNames
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

// 2. Update needMap
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

// 3. Update typeMap
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

// Fix encoding issues in the whole file just in case it got broken
content = content.replace(/ǭ/g, 'á');
content = content.replace(/Ǹ/g, 'é');
content = content.replace(//g, 'í');
content = content.replace(//g, 'ó');
content = content.replace(/ǧ/g, 'ú');
content = content.replace(//g, 'ñ');

// 4. Update ProductCard
const oldCardStart = 'function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {';
const beforeCard = content.substring(0, content.indexOf(oldCardStart));
const afterCardStart = content.substring(content.indexOf(oldCardStart));
const oldCardRegex = /function ProductCard\\(\\{ product, onAdd \\}: \\{ product: Product; onAdd: \\(\\) => void \\}\\) \\{[\\s\\S]*?<\\/article>\\r?\\n\\}/;

const newCard = \unction ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const cuota = product.price / 3;
  const transfer = product.price * 0.85;
  return (
    <article className="current-product-card">
      <div className="current-product-image-wrap">
        {product.soldOut ? <span className="stock-badge">SIN STOCK</span> : product.preorder ? <span className="stock-badge preorder">PREVENTA</span> : null}
        <img src={product.image} alt={\\ de \\} loading="eager" decoding="async" onError={(e) => loadImageFallback(e.currentTarget, originalProductImage(product.image))} />
      </div>
      <div className="current-product-copy">
        <div className="current-product-meta"><span>{product.brand}</span><span>{product.size}</span></div>
        <h3>{product.name}</h3>
        <p className="current-product-tags">{product.eyebrow.replace(/ \\u2014 /g, " \\u2022 ")}</p>
        
        <div className="current-product-price-block">
          <strong className="price-list">{formatPrice(product.price)}</strong>
          <span className="price-cuotas">3 cuotas sin interés de {formatPrice(cuota)}</span>
          <span className="price-transfer">15% OFF por transferencia <strong>{formatPrice(transfer)}</strong></span>
        </div>

        <details className="current-product-details">
          <summary>Ver producto</summary>
          <p>{product.description}</p>
          <p><strong>Ideal para:</strong> {product.skin}</p>
          <p><strong>Modo de uso:</strong> {product.use}</p>
        </details>
        <button className="current-buy-button" type="button" onClick={onAdd} disabled={product.soldOut}>{product.soldOut ? "Sin stock" : product.preorder ? "Reservar en preventa" : "Agregar al pedido"}</button>
      </div>
    </article>
  );
}\;

content = content.replace(oldCardRegex, newCard);

// 5. Update filters
content = content.replace('<option>MEDICUBE</option><option>SKIN1004</option><option>CELIMAX</option>', '<option>MEDICUBE</option><option>SKIN1004</option><option>CELIMAX</option><option>BEAUTY OF JOSEON</option><option>DR. ALTHEA</option><option>ANUA</option>');
content = content.replace('["Acné, poros y textura","Manchas y tono desigual","Piel seca y deshidratada","Barrera sensible","Líneas de expresión y firmeza","Luminosidad","Protección solar"]', '["Acné, poros y textura","Manchas y tono desigual","Piel seca y deshidratada","Barrera sensible","Líneas de expresión y firmeza","Luminosidad","Protección solar"]');
content = content.replace('["Limpiador","Sérum / Ampoule","Crema hidratante","Pads","Mascarilla","Protector solar","Kit / Rutina"]', '["Limpiador","Sérum / Ampoule","Crema hidratante","Pads","Mascarilla","Protector solar","Kit / Rutina","Contorno de ojos","Tónico","Tratamiento / Booster"]');

// 6. Update WhatsApp order link to include PREVENTA
content = content.replace(
  /...cartEntries.map\\(\\(\\{product, quantity\\}\\) => \\.*?c\\/u\\\\)/,
  \...cartEntries.map(({product, quantity}) => \\\\\u2022 \ x \\ \u2014 \ c/u\\\)\
);

fs.writeFileSync('app/page.tsx', content);
