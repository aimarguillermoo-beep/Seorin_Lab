"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import CookieConsent from "./cookie-consent";
import {
  CONSENT_CHANGE_EVENT,
  captureLandingParamsInMemory,
  ensureMetaPixelLoaded,
  getConsentStatus,
  trackMetaStandardEvent,
} from "@/lib/meta-client";

export default function MetaPixelProvider() {
  const pathname = usePathname();
  const hasTrackedInitialPageView = useRef(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    captureLandingParamsInMemory();

    const maybeTrackPageView = () => {
      if (getConsentStatus() !== "granted") return;
      ensureMetaPixelLoaded();
      // Evita doble disparo en React Strict Mode y al abrir/cerrar modales con pushState
      if (!hasTrackedInitialPageView.current) {
        hasTrackedInitialPageView.current = true;
        lastTrackedPath.current = window.location.pathname;
        trackMetaStandardEvent("PageView");
      }
    };

    maybeTrackPageView();

    const onConsentChange = (e: Event) => {
      const status = (e as CustomEvent<string>).detail;
      if (status === "granted") {
        maybeTrackPageView();
      }
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsentChange);
  }, [pathname]);

  return <CookieConsent />;
}
