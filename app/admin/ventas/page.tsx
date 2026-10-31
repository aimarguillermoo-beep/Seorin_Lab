import type { Metadata } from "next";
import PurchasePanel from "./purchase-panel";

export const metadata: Metadata = {
  title: "Confirmación de Ventas · Seorin Lab",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminVentasPage() {
  return <PurchasePanel />;
}
