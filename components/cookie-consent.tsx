"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_OPEN_EVENT,
  captureLandingParamsInMemory,
  getConsentStatus,
  setConsentStatus,
} from "@/lib/meta-client";

export default function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    captureLandingParamsInMemory();
    const current = getConsentStatus();
    if (current === null) {
      setVisible(true);
    }
    const handleOpen = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  if (!visible || pathname?.startsWith("/admin")) {
    return null;
  }

  const accept = () => {
    setConsentStatus("granted");
    setVisible(false);
  };

  const decline = () => {
    setConsentStatus("denied");
    setVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label="Preferencias de cookies y privacidad"
      className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-[680px] rounded-[14px] border border-[var(--line)] bg-[#fbf8f4]/95 px-4 py-3 text-[var(--ink)] shadow-[0_10px_30px_rgba(23,19,17,0.10)] backdrop-blur-md"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="m-0 text-[11.5px] leading-[1.45] text-[#554b46]">
          Utilizamos cookies propias y de terceros (Meta) con fines estadísticos y publicitarios para mejorar tu experiencia. Podés aceptar su uso o continuar solo con las esenciales.
        </p>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={decline}
            className="cursor-pointer rounded-full border border-[var(--line)] bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[#5f5550] transition-opacity hover:opacity-75"
          >
            Solo esenciales
          </button>
          <button
            type="button"
            onClick={accept}
            className="cursor-pointer rounded-full border border-[var(--ink)] bg-[var(--ink)] px-3.5 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </aside>
  );
}
