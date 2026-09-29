const fs = require('fs');
let content = fs.readFileSync('app/products.ts', 'utf-8');

const updates = {
  'Triple Collagen Serum 4.0': 49900,
  'Collagen Night Wrapping Mask': 59900,
  'Deep Vita C Pad': 58900,
  'Zero Pore Pad 2.0': 64900,
  'One Day Exosome Shot Pore Serum 2000': 49900,
  'Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++': 59900,
  'Madagascar Centella Watergel Sheet Ampoule Mask': 9300,
  'Pore + Dark Spot Brightening Pad': 44900,
  'The Real Noni Starter Kit': 49900,
  'The Vita A Retinol Shot Tightening Serum': 44900,
  'Dual Barrier Skin Wearable Cream': 58900
};

for (const [name, price] of Object.entries(updates)) {
  const safeName = name.replace(/[+]/g, '\\\\+');
  const regex = new RegExp('name: \\"' + safeName + '\\",[\\\\s\\\\S]*?price: (\\\\d+),', 'm');
  content = content.replace(regex, (match) => {
    return match.replace(/price: \\d+,/, 'price: ' + price + ',');
  });
}

content = content.replace(/transfer: \\d+,\r?\n\\s*/g, '');

const newProducts = \  {
    brand: "SKIN1004",
    name: "Madagascar Centella Poremizing Deep Cleansing Foam",
    size: "125 ml",
    eyebrow: "Limpieza profunda  control de sebo",
    description: "Espuma limpiadora rica y cremosa formulada para retirar impurezas y exceso de sebo. Su combinacin de sales minerales, kaolin y papaina ayuda a realizar una limpieza profunda y una exfoliacin suave, favoreciendo una piel ms limpia y una textura ms uniforme.",
    skin: "Piel grasa, mixta o normal con exceso de sebo, poros visibles o textura irregular.",
    use: "Aplic una pequea cantidad sobre las manos hmedas. Agregar agua y generar espuma. Masajear suavemente sobre el rostro hmedo evitando el rea de los ojos. Enjuagar completamente.",
    price: 44900,
    image: "/products-v12/skin1004-poremizing-foam.jpeg",
    accent: "#e5b4b7",
  },
  {
    brand: "SKIN1004",
    name: "Madagascar Centella Ampoule Foam",
    size: "125 ml",
    eyebrow: "Limpieza suave  hidratacin",
    description: "Limpiador facial espumoso de pH aproximado 5 diseado para retirar impurezas y residuos sin dejar una sensacin excesivamente tirante. Ayuda a limpiar mientras mantiene una sensacin confortable e hidratada.",
    skin: "Piel normal, sensible o deshidratada que busca limpieza diaria suave.",
    use: "Aplic una pequea cantidad sobre las manos hmedas. Generar espuma con agua. Masajear suavemente sobre el rostro hmedo. Enjuagar completamente.",
    price: 44900,
    image: "/products-v12/skin1004-ampoule-foam.jpeg",
    accent: "#b78759",
  },
  {
    brand: "BEAUTY OF JOSEON",
    name: "Daily Tinted Fluid Sunscreen SPF 40 LP110",
    size: "50 ml",
    eyebrow: "SPF 40  cobertura ligera",
    description: "Protector solar mineral con color que combina proteccin SPF 40 de amplio espectro con una cobertura ligera y translcida. Su textura fluida ayuda a unificar visualmente el tono sin sentirse como una base pesada. Acabado natural.",
    skin: "Uso diario para quienes buscan protector solar con color, cobertura ligera y acabado natural.",
    use: "Agitar bien antes de usar. Aplicar generosamente como ltimo paso de la rutina de skincare. Distribuir de manera uniforme sobre el rostro. Reaplicar durante el da.",
    price: 69900,
    image: "/products-v12/boj-tinted-sunscreen.jpeg",
    accent: "#d4a991",
    preorder: true,
  },
  {
    brand: "DR. ALTHEA",
    name: "345 Relief Cream",
    size: "50 ml",
    eyebrow: "Barrera  marcas post-brote",
    description: "Crema hidratante de textura ligera formulada especialmente para piel sensibilizada o con tendencia a imperfecciones. Ayuda a mantener la hidratacin, calmar la piel y reforzar la barrera cutnea. Orientada al cuidado visible de marcas.",
    skin: "Piel sensible, sensibilizada, barrera alterada o marcas post-brote.",
    use: "Aplicar como ltimo paso de la rutina. Distribuir una cantidad adecuada sobre rostro y cuello. Presionar suavemente hasta absorber.",
    price: 59900,
    image: "/products-v12/dr-althea-345.jpeg",
    accent: "#a9b9b1",
  },
  {
    brand: "CELIMAX",
    name: "The Vita-A Retinal Shot Tightening Booster",
    size: "15 ml",
    eyebrow: "0,1% retinal  textura  firmeza",
    description: "Booster nocturno formulado con retinal para ayudar a mejorar gradualmente la apariencia de lneas finas, textura irregular, prdida de firmeza y poros visibles. Combina retinal con pptidos y la tecnologa A-Shot.",
    skin: "Lneas finas, textura irregular, apariencia de poros o prdida de firmeza.",
    use: "Utilizar por la noche. Aplicar una pequea cantidad. Si es la primera vez, usar noche por medio durante las primeras dos semanas. Acompaar con hidratante. Usar protector solar de da.",
    price: 44900,
    image: "/products-v12/celimax-retinal.jpeg",
    accent: "#d7dd41",
    preorder: true,
  },
  {
    brand: "BEAUTY OF JOSEON",
    name: "Revive Eye Serum: Ginseng + Retinal",
    size: "30 ml",
    eyebrow: "Lneas finas  firmeza  luminosidad",
    description: "Srum para el contorno de ojos formulado con ginseng y retinal. Ayuda a mejorar gradualmente la apariencia de lneas finas y firmeza mientras aporta hidratacin y luminosidad. Textura ligera y de rpida absorcin.",
    skin: "Primeras lneas, contorno seco, aspecto cansado o falta de luminosidad.",
    use: "Presionar 1 o 2 veces. Aplicar con el dedo anular alrededor del contorno. Dar suaves toques hasta absorber. Finalizar con protector solar. Consultar a un profesional si hay embarazo o lactancia.",
    price: 49900,
    image: "/products-v12/boj-eye-serum.jpeg",
    accent: "#efdfd4",
  },
  {
    brand: "ANUA",
    name: "Azelaic Acid 10 Hyaluron Redness Soothing Serum",
    size: "30 ml",
    eyebrow: "Rojeces  imperfecciones  textura",
    description: "Srum ligero y no comedognico formulado con 10% de cido azelaico. Ayuda a calmar el aspecto del enrojecimiento, mejorar visualmente imperfecciones y marcas y equilibrar el exceso de sebo.",
    skin: "Piel sensible, grasa o mixta con rojeces, imperfecciones o textura irregular.",
    use: "Comenzar utilizando 1-2 gotas, 1-2 veces por semana e ir aumentando. Aplicar despus del tnico y antes de la crema. Finalizar con protector solar de da.",
    price: 64900,
    image: "/products-v12/anua-azelaic.jpeg",
    accent: "#76c04f",
    preorder: true,
  },
  {
    brand: "SKIN1004",
    name: "Madagascar Centella Toning Toner",
    size: "210 ml",
    eyebrow: "PHA  exfoliacin suave  textura",
    description: "Tnico acuoso formulado con PHA para realizar una exfoliacin superficial suave. Ayuda a retirar gradualmente exceso de sebo y clulas muertas mientras aporta efecto calmante y favorece una textura ms uniforme.",
    skin: "Piel normal, sensible o mixta con textura irregular o piel opaca.",
    use: "Despus de la limpieza, aplicar sobre un algodn o con las manos. Distribuir suavemente sobre rostro y cuello. Continuar con srum y crema hidratante.",
    price: 54900,
    image: "/products-v12/skin1004-toner.jpeg",
    accent: "#c29d60",
  },\n\;

content = content.replace('];', newProducts + '];');

fs.writeFileSync('app/products.ts', content);
