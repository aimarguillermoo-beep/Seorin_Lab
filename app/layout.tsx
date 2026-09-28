import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seorin Lab | Skincare original",
  description:
    "Catálogo de skincare: SKIN1004, CELIMAX y MEDICUBE. Armá tu carrito y enviá el pedido por WhatsApp.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
