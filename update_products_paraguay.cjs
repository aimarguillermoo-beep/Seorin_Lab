const fs = require('fs');
let content = fs.readFileSync('app/products.ts', 'utf-8');

// 1. Update Collagen Niacinamide Jelly Cream
content = content.replace(
  /name: "Collagen Niacinamide Jelly Cream",[\s\S]*?accent: "#e8a9b4",(\s*soldOut: true,)?\s*\}/,
  \
ame: "Collagen Niacinamide Jelly Cream",
    size: "110 ml",
    eyebrow: "Hidratación · glow · elasticidad",
    description: "Crema hidratante transparente de textura jelly que aporta hidratación y un acabado luminoso tipo glass skin. Su fórmula con niacinamida, colágeno hidrolizado y escualano ayuda a dejar la piel más suave, tersa y con aspecto elástico.",
    skin: "Piel deshidratada, opaca o con pérdida de elasticidad que busca una crema de textura jelly y acabado luminoso.",
    use: "Aplicar como último paso de la rutina, después de los sérums. Puede utilizarse por la mañana o por la noche.",
    price: 52900,
    image: "/products-v12/medicube-jelly-110.jpeg",
    accent: "#e8a9b4",
    preorder: true
  }\
);

// 2. Update Madagascar Centella Light Cleansing Oil
content = content.replace(
  /name: "Madagascar Centella Light Cleansing Oil",[\s\S]*?accent: "#e9d2a7",(\s*soldOut: true,)?\s*\}/,
  \
ame: "Madagascar Centella Light Cleansing Oil",
    size: "200 ml",
    eyebrow: "Doble limpieza · maquillaje · protector solar",
    description: "Aceite limpiador ligero que ayuda a disolver maquillaje, protector solar y exceso de sebo. Su fórmula con centella y aceites botánicos emulsiona al contacto con agua y se enjuaga sin dejar una sensación pesada.",
    skin: "Primera etapa de la doble limpieza, especialmente para retirar maquillaje, protector solar e impurezas oleosas.",
    use: "Aplicar sobre rostro y manos secos. Masajear suavemente, agregar un poco de agua hasta que el aceite emulsione y tome una textura lechosa, y luego enjuagar. Continuar con un limpiador base agua si se realiza doble limpieza.",
    price: 54900,
    image: "/products-v11/skin1004-cleansing.webp",
    accent: "#e9d2a7",
    preorder: true
  }\
);

// 3. Add 4 new products
const newProducts = [
  {
    brand: "MEDICUBE",
    name: "TXA Niacinamide 15% Serum",
    size: "30 ml",
    eyebrow: "Manchas · tono uniforme · luminosidad",
    description: "Sérum concentrado para trabajar la apariencia de manchas, marcas post-brote y tono desigual. Combina 5% de ácido tranexámico, 10% de niacinamida y 2% de arbutina, junto con ingredientes hidratantes, en una textura ligera.",
    skin: "Piel con manchas, marcas post-brote, tono irregular u opacidad.",
    use: "Aplicar unas gotas después del tónico y antes de la crema hidratante. Puede utilizarse por la mañana o por la noche. Durante el día, finalizar siempre con protector solar.",
    price: 59900,
    image: "/products-v12/medicube-txa-serum.jpeg",
    accent: "#eb7c8a",
    preorder: true
  },
  {
    brand: "DR. ALTHEA",
    name: "Vitamin C Boosting Serum",
    size: "30 ml",
    eyebrow: "Manchas · luminosidad · tono uniforme",
    description: "Sérum iluminador formulado para ayudar a mejorar la apariencia de manchas, marcas post-brote y tono desigual. Combina agua de espino amarillo, ácido tranexámico, niacinamida, derivados de vitamina C y alpha-arbutin para aportar luminosidad sin dejar de lado la hidratación.",
    skin: "Piel apagada o con manchas, marcas posteriores a brotes y tono irregular.",
    use: "Aplicar unas gotas después de la limpieza y el tónico. Continuar con crema hidratante. Puede utilizarse por la mañana o por la noche; durante el día finalizar siempre con protector solar.",
    price: 59900,
    image: "/products-v12/dr-althea-vit-c.jpeg",
    accent: "#d8853b",
    preorder: true
  },
  {
    brand: "SKIN1004",
    name: "Madagascar Centella Probio-Cica Bakuchiol Eye Cream",
    size: "20 ml",
    eyebrow: "Líneas finas · firmeza · hidratación",
    description: "Contorno de ojos con centella fermentada y bakuchiol que ayuda a mejorar visualmente la apariencia de líneas finas y firmeza mientras aporta hidratación a la zona. También contiene ceramida y ácido hialurónico para mantener el contorno confortable.",
    skin: "Contornos normales o secos con primeras líneas, falta de firmeza o deshidratación.",
    use: "Aplicar una pequeña cantidad alrededor del contorno de ojos y masajear suavemente desde el interior hacia el exterior hasta absorber.",
    price: 54900,
    image: "/products-v12/skin1004-probio-cica-eye.jpeg",
    accent: "#b09b85",
    preorder: true
  },
  {
    brand: "MEDICUBE",
    name: "PDRN Pink Collagen Capsule Cream",
    size: "55 g",
    eyebrow: "Glow · hidratación · elasticidad",
    description: "Crema de doble textura que combina cápsulas rosadas con un gel transparente para aportar hidratación y luminosidad y ayudar a mejorar la apariencia de elasticidad y tono desigual. Su fórmula incluye PDRN de salmón, colágeno, ácido hialurónico y niacinamida.",
    skin: "Piel deshidratada, apagada o con pérdida de elasticidad que busca un acabado luminoso.",
    use: "Mezclar las cápsulas con el gel antes de aplicar. Utilizar más gel para una textura ligera o una mayor proporción de cápsulas para una sensación más nutritiva. Aplicar después del sérum, por la mañana o por la noche.",
    price: 59900,
    image: "/products-v12/medicube-pdrn-capsule.jpeg",
    accent: "#f4a2b9",
    preorder: true
  }
];

let addedString = '';
for (const p of newProducts) {
  addedString += '  {\n';
  for (const [k, v] of Object.entries(p)) {
    if (typeof v === 'string') addedString += '    ' + k + ': "' + v + '",\n';
    else addedString += '    ' + k + ': ' + v + ',\n';
  }
  addedString += '  },\n';
}

content = content.replace('];', addedString + '];');

// Fix any mangled characters from previous scripts in both arrays
content = content.replace(/Ǹ/g, 'é').replace(/ǭ/g, 'á').replace(//g, 'í').replace(/ǧ/g, 'ú').replace(//g, 'ó').replace(//g, 'ñ');

fs.writeFileSync('app/products.ts', content, 'utf-8');
