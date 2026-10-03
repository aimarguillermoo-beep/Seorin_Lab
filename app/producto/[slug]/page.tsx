import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Catalog from "../../catalog";
import { getProductBySlug } from "../../products";

type Props = { params: Promise<{ slug: string }> };

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

// Metadatos por producto: cuando se comparte el link por WhatsApp/Instagram/etc. se ve la foto, el nombre y el precio.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  const title = `${product.name} | Seorin Lab`;
  const transfer = product.transfer || Math.round(product.price / 1.15);
  const description = `${product.brand} · ${product.size} — ${formatPrice(transfer)} por transferencia. ${product.description}`;

  return {
    metadataBase: new URL(`${proto}://${host}`),
    title,
    description,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Seorin Lab",
      locale: "es_AR",
      title,
      description,
      url: `/producto/${slug}`,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [product.image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!getProductBySlug(slug)) notFound();
  return <Catalog initialSlug={slug} />;
}
