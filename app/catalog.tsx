"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { products, productPath, getProductBySlug, type Product } from "./products";

const whatsappNumber = "5491125578250";
const formatPrice = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
const originalProductImage = (image: string) => image.replace("/products-v11/", "/products/").replace(/\.webp$/, ".png");
const loadImageFallback = (el: HTMLImageElement, fallback: string) => { if (el.dataset.fallbackApplied === "true") return; el.dataset.fallbackApplied = "true"; el.src = fallback; };
const whatsappLink = (text: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

const catalogNames = [
  "Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++",
  "Madagascar Centella Watergel Sheet Ampoule Mask",
  "Pore + Dark Spot Brightening Pad",
  "The Vita A Retinol Shot Tightening Serum",
  "Dual Barrier Skin Wearable Cream",
  "One Day Exosome Shot Pore Serum 2000",
  "Collagen Night Wrapping Mask",
  "Triple Collagen Serum 4.0",
  "Deep Vita C Pad",
  "Zero Pore Pad 2.0",
  "Madagascar Centella Light Cleansing Oil",
  "Collagen Niacinamide Jelly Cream",
  "Madagascar Centella Poremizing Deep Cleansing Foam",
  "Madagascar Centella Ampoule Foam",
  "Daily Tinted Fluid Sunscreen SPF 40 LP110",
  "345 Relief Cream",
  "The Vita-A Retinal Shot Tightening Booster",
  "Revive Eye Serum: Ginseng + Retinal",
  "Azelaic Acid 10 Hyaluron Redness Soothing Serum",
  "Madagascar Centella Toning Toner",
  "TXA Niacinamide 15% Serum",
  "Vitamin C Boosting Serum",
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream",
  "PDRN Pink Collagen Capsule Cream",
  "Dúo Clean & Balance",
  "Dúo Glass Skin",
  "Dúo Anti-Age",
  "Dúo Poros & Textura",
  "Dúo Calm & Clear",
  "Dúo Brightening",
];

const featuredNames = [
  "Azelaic Acid 10 Hyaluron Redness Soothing Serum",
  "The Vita-A Retinal Shot Tightening Booster",
  "345 Relief Cream",
  "One Day Exosome Shot Pore Serum 2000",
];

const getProduct = (name: string) => products.find((p) => p.name === name)!;
const catalogProducts = catalogNames.map(getProduct);
const featuredProducts = featuredNames.map(getProduct);

const needMap: Record<string, string[]> = {
  "Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++": ["Protección solar", "Piel seca y deshidratada"],
  "Madagascar Centella Watergel Sheet Ampoule Mask": ["Piel seca y deshidratada", "Barrera sensible"],
  "Madagascar Centella Light Cleansing Oil": [],
  "Pore + Dark Spot Brightening Pad": ["Manchas y tono desigual", "Luminosidad", "Acné, poros y textura"],
  "The Real Noni Starter Kit": ["Piel seca y deshidratada", "Barrera sensible"],
  "The Vita A Retinol Shot Tightening Serum": ["Líneas de expresión y firmeza", "Acné, poros y textura"],
  "Dual Barrier Skin Wearable Cream": ["Barrera sensible", "Piel seca y deshidratada"],
  "One Day Exosome Shot Pore Serum 2000": ["Acné, poros y textura"],
  "Collagen Night Wrapping Mask": ["Piel seca y deshidratada", "Líneas de expresión y firmeza", "Luminosidad"],
  "Triple Collagen Serum 4.0": ["Piel seca y deshidratada", "Líneas de expresión y firmeza", "Luminosidad"],
  "Deep Vita C Pad": ["Manchas y tono desigual", "Luminosidad"],
  "Zero Pore Pad 2.0": ["Acné, poros y textura"],
  "Collagen Niacinamide Jelly Cream": ["Piel seca y deshidratada", "Luminosidad", "Líneas de expresión y firmeza"],
  "Madagascar Centella Poremizing Deep Cleansing Foam": ["Acné, poros y textura"],
  "Madagascar Centella Ampoule Foam": ["Piel seca y deshidratada", "Barrera sensible"],
  "Daily Tinted Fluid Sunscreen SPF 40 LP110": ["Protección solar", "Manchas y tono desigual"],
  "345 Relief Cream": ["Barrera sensible", "Piel seca y deshidratada", "Manchas y tono desigual"],
  "The Vita-A Retinal Shot Tightening Booster": ["Líneas de expresión y firmeza", "Acné, poros y textura"],
  "Revive Eye Serum: Ginseng + Retinal": ["Líneas de expresión y firmeza", "Piel seca y deshidratada", "Luminosidad"],
  "Azelaic Acid 10 Hyaluron Redness Soothing Serum": ["Acné, poros y textura", "Manchas y tono desigual", "Barrera sensible"],
  "Madagascar Centella Toning Toner": ["Acné, poros y textura", "Luminosidad"],
  "TXA Niacinamide 15% Serum": ["Manchas y tono desigual","Luminosidad"],
  "Vitamin C Boosting Serum": ["Manchas y tono desigual","Luminosidad"],
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream": ["Líneas de expresión y firmeza","Piel seca y deshidratada"],
  "PDRN Pink Collagen Capsule Cream": ["Piel seca y deshidratada","Luminosidad","Líneas de expresión y firmeza"],
  "Dúo Clean & Balance": [],
  "Dúo Glass Skin": ["Piel seca y deshidratada", "Luminosidad", "Líneas de expresión y firmeza"],
  "Dúo Anti-Age": ["Líneas de expresión y firmeza", "Acné, poros y textura"],
  "Dúo Poros & Textura": ["Acné, poros y textura"],
  "Dúo Calm & Clear": ["Acné, poros y textura", "Manchas y tono desigual", "Barrera sensible"],
  "Dúo Brightening": ["Manchas y tono desigual", "Luminosidad"],
};
const needFor = (p: Product) => needMap[p.name] || [];

const typeMap: Record<string, string> = {
  "Hyalu-Cica Water-Fit Sun Serum SPF50+ PA++++": "Protector solar",
  "Madagascar Centella Watergel Sheet Ampoule Mask": "Mascarilla",
  "Madagascar Centella Light Cleansing Oil": "Limpiador",
  "Pore + Dark Spot Brightening Pad": "Pads",
  "The Real Noni Starter Kit": "Kit / Rutina",
  "The Vita A Retinol Shot Tightening Serum": "Sérum / Ampoule",
  "Dual Barrier Skin Wearable Cream": "Crema hidratante",
  "One Day Exosome Shot Pore Serum 2000": "Sérum / Ampoule",
  "Collagen Night Wrapping Mask": "Mascarilla",
  "Triple Collagen Serum 4.0": "Sérum / Ampoule",
  "Deep Vita C Pad": "Pads",
  "Zero Pore Pad 2.0": "Pads",
  "Collagen Niacinamide Jelly Cream": "Crema hidratante",
  "Madagascar Centella Poremizing Deep Cleansing Foam": "Limpiador",
  "Madagascar Centella Ampoule Foam": "Limpiador",
  "Daily Tinted Fluid Sunscreen SPF 40 LP110": "Protector solar",
  "345 Relief Cream": "Crema hidratante",
  "The Vita-A Retinal Shot Tightening Booster": "Tratamiento / Booster",
  "Revive Eye Serum: Ginseng + Retinal": "Contorno de ojos",
  "Azelaic Acid 10 Hyaluron Redness Soothing Serum": "Sérum / Ampoule",
  "Madagascar Centella Toning Toner": "Tónico",
  "TXA Niacinamide 15% Serum": "Sérum / Ampoule",
  "Vitamin C Boosting Serum": "Sérum / Ampoule",
  "Madagascar Centella Probio-Cica Bakuchiol Eye Cream": "Contorno de ojos",
  "PDRN Pink Collagen Capsule Cream": "Crema hidratante",
  "Dúo Clean & Balance": "Kit / Rutina",
  "Dúo Glass Skin": "Kit / Rutina",
  "Dúo Anti-Age": "Kit / Rutina",
  "Dúo Poros & Textura": "Kit / Rutina",
  "Dúo Calm & Clear": "Kit / Rutina",
  "Dúo Brightening": "Kit / Rutina",
};
const typeFor = (p: Product) => typeMap[p.name] || "Otros";

function ProductCard({ product, onAdd, onOpen }: { product: Product; onAdd: () => void; onOpen: () => void }) {
  const cuota = product.price / 3;
  const transfer = product.transfer || Math.round(product.price / 1.15);
  const href = productPath(product);
  // Permite abrir en pestaña nueva / copiar link con click derecho, pero con click normal abre el modal sin recargar.
  const handleOpen = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen();
  };
  return (
      <article className="current-product-card">
        <a href={href} onClick={handleOpen} className="current-product-image-wrap cursor-pointer group" aria-label={`Ver ${product.name}`}>
            {product.soldOut ? <span className="stock-badge">SIN STOCK</span> : product.preorder ? <span className="stock-badge preorder">PREVENTA</span> : null}
            <img src={product.image} alt={`${product.name} de ${product.brand}`} loading="eager" decoding="async" onError={(e) => loadImageFallback(e.currentTarget, originalProductImage(product.image))} className="transition-transform group-hover:scale-105 duration-500" />
        </a>
        <div className="current-product-copy">
          <div className="current-product-meta"><span>{product.brand}</span><span>{product.size}</span></div>
          <h3>{product.name}</h3>
          <p className="current-product-tags">{product.eyebrow}</p>
          
          <div className="current-product-price-block">
            <div className="price-secondary-group">
              <span className="price-list">{formatPrice(product.price)}</span>
              <span className="price-cuotas">3 cuotas sin interés de {formatPrice(cuota)}</span>
            </div>
            <div className="price-transfer-group">
              <span className="transfer-badge">Transferencia · <span className="off-tag">15% off</span></span>
              <strong className="transfer-price">{formatPrice(transfer)}</strong>
            </div>
          </div>

          <a href={href} onClick={handleOpen} className="current-product-details block text-left cursor-pointer w-full bg-transparent border-0 p-0 m-[14px_0] border-y border-[var(--line)] no-underline">
            <div className="py-[15px] text-[11px] font-[750] tracking-[.05em] flex items-center gap-2 text-[var(--ink)]">
              <span className="text-[14px] leading-none">▸</span> Ver producto
            </div>
          </a>

          <button className="current-buy-button" type="button" onClick={onAdd} disabled={product.soldOut}>{product.soldOut ? "Sin stock" : "Agregar al pedido"}</button>
        </div>
      </article>
  );
}

function ProductModal({ product, open, onOpenChange, onAdd }: { product: Product | null; open: boolean; onOpenChange: (open: boolean) => void; onAdd: (p: Product) => void }) {
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  if (!product) return null;
  const copied = copiedFor === product.name;
  const cuota = product.price / 3;
  const transfer = product.transfer || Math.round(product.price / 1.15);

  const share = async () => {
    const url = `${window.location.origin}${productPath(product)}`;
    const data = { title: `${product.name} · Seorin Lab`, text: `${product.brand} — ${product.name}`, url };
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) { await navigator.share(data); return; }
    } catch { return; /* el usuario canceló */ }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copiá el link del producto:", url);
      return;
    }
    setCopiedFor(product.name);
    setTimeout(() => setCopiedFor(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="product-modal-content" showCloseButton={false}>
        <DialogClose className="product-modal-close" aria-label="Cerrar">✕</DialogClose>
        <div className="product-modal-grid">
          {/* Image */}
          <div className="product-modal-image" style={{ "--accent": product.accent } as React.CSSProperties}>
            {product.soldOut ? <span className="stock-badge">SIN STOCK</span> : product.preorder ? <span className="stock-badge preorder">PREVENTA</span> : null}
            <img src={product.image} alt={product.name} />
          </div>

          {/* Info */}
          <div className="product-modal-info">
            <div className="product-modal-info-scroll">
              <DialogHeader className="product-modal-header">
                <DialogDescription className="product-modal-brand">{product.brand} · {product.size}</DialogDescription>
                <DialogTitle className="product-modal-title">{product.name}</DialogTitle>
                <p className="product-modal-eyebrow">{product.eyebrow}</p>
              </DialogHeader>

              <div className="product-modal-body">
                <p>{product.description}</p>
                <p><strong>Ideal para:</strong> {product.skin}</p>
                <p><strong>Modo de uso:</strong> {product.use}</p>
              </div>
            </div>

            <div className="product-modal-footer">
              <div className="product-modal-prices">
                <div>
                  <span className="product-modal-price-label">Transferencia · <span className="off-tag">15% off</span></span>
                  <span className="product-modal-price-value">{formatPrice(transfer)}</span>
                </div>
                <div>
                  <span className="product-modal-price-label">Tarjeta</span>
                  <span className="product-modal-price-card">{formatPrice(product.price)}</span>
                  <span className="product-modal-price-cuotas">3 cuotas sin interés de {formatPrice(cuota)}</span>
                </div>
              </div>
              <div className="product-modal-actions">
                <button className="current-buy-button" type="button" onClick={() => onAdd(product)} disabled={product.soldOut}>
                  {product.soldOut ? "Sin stock" : "Agregar al pedido"}
                </button>
                <button className="product-modal-share" type="button" onClick={share} aria-label="Compartir producto">
                  {copied ? "¡Link copiado!" : "Compartir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const SITE_TITLE = "Seorin Lab | Skincare original";
const productFromPath = (path: string) => {
  const m = path.match(/^\/producto\/([^/?#]+)/);
  return m ? getProductBySlug(decodeURIComponent(m[1])) ?? null : null;
};

export default function Catalog({ initialSlug }: { initialSlug?: string }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [need, setNeed] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");

  // Modal de producto sincronizado con la URL (/producto/<slug>) para poder compartir cada producto.
  const [modalProduct, setModalProduct] = useState<Product | null>(() => (initialSlug ? getProductBySlug(initialSlug) ?? null : null));
  const [modalOpen, setModalOpen] = useState(() => modalProduct !== null);

  const openProduct = useCallback((p: Product) => {
    setModalProduct(p);
    setModalOpen(true);
    const path = productPath(p);
    if (window.location.pathname !== path) window.history.pushState({ seorinModal: true }, "", path);
  }, []);

  const closeProduct = useCallback(() => {
    setModalOpen(false);
    if (!productFromPath(window.location.pathname)) return;
    // Si el modal se abrió desde el catálogo, volvemos en el historial; si se entró directo por link, reemplazamos la URL.
    if (window.history.state?.seorinModal) window.history.back();
    else window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    const onPop = () => {
      const p = productFromPath(window.location.pathname);
      if (p) setModalProduct(p);
      setModalOpen(p !== null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.title = modalOpen && modalProduct ? `${modalProduct.name} | Seorin Lab` : SITE_TITLE;
  }, [modalOpen, modalProduct]);

  const filtered = useMemo(() => {
    const result = catalogProducts.filter((p) => {
      if (need && !needFor(p).includes(need)) return false;
      if (brand && p.brand !== brand && !p.brand.includes(brand)) return false;
      if (type && typeFor(p) !== type) return false;
      return true;
    });
    result.sort((a, b) => (a.soldOut === b.soldOut ? 0 : a.soldOut ? 1 : -1));
    return result;
  }, [need, brand, type]);

  const cartEntries = Object.entries(cart).map(([name, quantity]) => ({ product: getProduct(name), quantity })).filter((x) => x.product && x.quantity > 0);
  const cartCount = cartEntries.reduce((sum, x) => sum + x.quantity, 0);
  const cartTotal = cartEntries.reduce((sum, x) => sum + x.product.price * x.quantity, 0);
  const addToCart = (p: Product) => { if (p.soldOut) return; setCart((c) => ({ ...c, [p.name]: (c[p.name] || 0) + 1 })); setCartOpen(true); };
  const setQuantity = (name: string, q: number) => setCart((c) => { const n = { ...c }; if (q <= 0) delete n[name]; else n[name] = q; return n; });
  const orderLink = whatsappLink(["Hola Seorin Lab. Quiero hacer este pedido:", "", ...cartEntries.map(({product, quantity}) => `\u2022 ${quantity} x ${product.name}${product.preorder ? " (PREVENTA)" : ""} \u2014 ${formatPrice(product.price)} c/u`), "", `Total base: ${formatPrice(cartTotal)}`, "¿Me confirmás stock, pago y envío?"].join("\n"));

  return (
    <main>
      <div className="announcement">Skincare original · Todos los medios de pago · Envíos a todo el país</div>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <header className="site-header">
          <a className="wordmark" href="#inicio"><img className="brand-logo" src="/seorin-lab-emblem.webp" alt="" /><span>SEORIN LAB</span></a>
          <nav aria-label="Navegación principal">
            <a href="#productos">Productos</a><a href="#segun-tu-piel">Según tu piel</a><a href="#envios-pagos">Envíos y pagos</a>
            <SheetTrigger asChild><button className="nav-cta cart-trigger" type="button">Carrito <span>{cartCount}</span></button></SheetTrigger>
          </nav>
        </header>
        <SheetContent className="cart-sheet">
          <SheetHeader className="cart-header"><p className="kicker">Tu selección</p><SheetTitle>Carrito Seorin Lab</SheetTitle><SheetDescription>Revisá las cantidades y envianos el pedido por WhatsApp.</SheetDescription></SheetHeader>
          <div className="cart-body">{cartEntries.length === 0 ? <div className="cart-empty"><span>✣</span><p>Tu carrito está vacío.</p></div> : cartEntries.map(({product, quantity}) => <article className="cart-item" key={product.name}><img src={product.image} alt="" /><div><span>{product.brand}</span><strong>{product.name}</strong><p>{formatPrice(product.price)}</p><div className="quantity-control"><button onClick={() => setQuantity(product.name, quantity - 1)}>−</button><span>{quantity}</span><button onClick={() => setQuantity(product.name, quantity + 1)}>+</button></div></div></article>)}</div>
          {cartEntries.length > 0 && <div className="cart-footer"><div className="cart-total"><span>Total base</span><strong>{formatPrice(cartTotal)}</strong></div><a href={orderLink} target="_blank" rel="noreferrer">Enviar pedido por WhatsApp <span>↗</span></a></div>}
        </SheetContent>
      </Sheet>

      <ProductModal product={modalProduct} open={modalOpen} onOpenChange={(o) => { if (!o) closeProduct(); }} onAdd={addToCart} />

      <section className="hero current-hero" id="inicio">
        <div className="hero-copy"><p className="kicker">SEORIN LAB</p><h1>Skincare coreano original.</h1><p className="hero-lead">Encontrá el producto ideal para tu piel.</p><div className="hero-actions"><a className="primary-button" href="#productos">Ver productos</a><a className="text-link" href="#segun-tu-piel">Comprar según mi piel</a></div></div>
        <div className="hero-visual" aria-label="Selección de productos Seorin Lab"><div className="hero-orbit orbit-one"><img src="/hero-v11/skin1004-sun.webp" alt="Protector solar SKIN1004" /></div><div className="hero-orbit orbit-two"><img src="/hero-v11/medicube-jelly.webp" alt="Collagen Jelly Cream de Medicube" /></div><div className="hero-orbit orbit-three"><img src="/hero-v11/celimax-noni.webp" alt="The Real Noni Starter Kit de Celimax" /></div><span className="hero-stamp">K-BEAUTY<br/>CURATED</span></div>
      </section>

      <section className="current-needs" id="segun-tu-piel">
        <p className="kicker">Empezá por tu piel</p><h2>¿Qué querés tratar?</h2><p>Elegí una necesidad y descubrí las opciones disponibles.</p>
        <div className="need-grid">{["Acné, poros y textura","Manchas y tono desigual","Piel seca y deshidratada","Barrera sensible","Líneas de expresión y firmeza","Luminosidad","Protección solar"].map((x) => <button key={x} onClick={() => { setNeed(x); document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }); }}>{x}</button>)}</div>
      </section>

      <section className="featured-section">
        <div className="section-heading-row"><div><p className="kicker">Selección Seorin Lab</p><h2>Destacados para tu rutina</h2></div><a href="#productos">Ver todo el catálogo</a></div>
        <div className="featured-grid">{featuredProducts.map((p) => <ProductCard key={p.name} product={p} onAdd={() => addToCart(p)} onOpen={() => openProduct(p)} />)}</div>
      </section>


      <section className="current-catalog" id="productos">
        <div className="catalog-intro"><p className="kicker">Tu rutina, a tu manera</p><h2>Encontrá tu próximo esencial.</h2></div>
        <div className="filters">
          <label><span className="hidden sm:inline">Tipo de producto</span><span className="sm:hidden">Tipo</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="">Todos</option>{["Limpiador","Sérum / Ampoule","Crema hidratante","Pads","Mascarilla","Protector solar","Kit / Rutina","Contorno de ojos","Tónico","Tratamiento / Booster"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Necesidad<select value={need} onChange={(e) => setNeed(e.target.value)}><option value="">Todas</option>{["Acné, poros y textura","Manchas y tono desigual","Piel seca y deshidratada","Barrera sensible","Líneas de expresión y firmeza","Luminosidad","Protección solar"].map((x) => <option key={x}>{x}</option>)}</select></label>
          <label>Marca<select value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">Todas</option><option>MEDICUBE</option><option>SKIN1004</option><option>CELIMAX</option><option>BEAUTY OF JOSEON</option><option>DR. ALTHEA</option><option>ANUA</option></select></label>
        </div>
        <div className="product-count">{filtered.length} productos</div>
        <div className="current-catalog-grid">{filtered.map((p) => <ProductCard key={p.name} product={p} onAdd={() => addToCart(p)} onOpen={() => openProduct(p)} />)}</div>
        <div className="catalog-help"><a href={whatsappLink("Hola Seorin Lab. Necesito ayuda para elegir.")} target="_blank" rel="noreferrer">¿Necesitás ayuda para elegir?</a></div>
      </section>

      <section className="advisor-section"><p className="kicker">Te acompañamos a elegir</p><h2>¿No sabés qué elegir?</h2><p>Contanos qué querés tratar y te ayudamos a encontrar los productos indicados para tu piel.</p><a className="primary-button" href={whatsappLink("Hola Seorin Lab. Quiero asesoramiento para elegir productos según mi piel.")} target="_blank" rel="noreferrer">Quiero asesoramiento</a></section>

      <section className="payment-shipping" id="envios-pagos">
        <div><p className="kicker">Todos los medios de pago</p><h2>Elegí cómo pagar.</h2><p>Transferencia, débito y crédito.</p><p>Consultá por 3 y 6 cuotas.</p></div>
        <div><p className="kicker">Envíos a todo el país</p><h2>Coordinamos tu envío.</h2><p>Consultanos con tu localidad y código postal para conocer la modalidad, el costo y el plazo de entrega.</p><a className="text-link" href={whatsappLink("Hola Seorin Lab. Quiero consultar el envío a mi localidad.")} target="_blank" rel="noreferrer">Consultar mi envío ↗</a></div>
      </section>

      <footer><div className="footer-brand"><div className="wordmark"><img className="brand-logo" src="/seorin-lab-emblem.webp" alt=""/><span>SEORIN LAB</span></div><p>Skincare original. Piel luminosa y saludable, con una rutina que tenga sentido para vos.</p></div><div className="footer-links"><div><span>WhatsApp</span><a href="https://wa.me/5491125578250" target="_blank" rel="noreferrer">+54 9 11 2557-8250</a></div><div><span>Instagram</span><a href="https://instagram.com/seorinlab.skincare" target="_blank" rel="noreferrer">@seorinlab.skincare</a></div><div><span>Email</span><a href="mailto:seorin_lab@outlook.com">seorin_lab@outlook.com</a></div></div><p className="legal">Las descripciones se refieren a beneficios cosméticos y no sustituyen diagnóstico ni tratamiento dermatológico. Precios expresados en pesos argentinos.</p></footer>
    </main>
  );
}



