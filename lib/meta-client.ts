"use client";

export type ConsentStatus = "granted" | "denied" | null;
export type StorefrontMetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";

export type MetaClientContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type MetaClientCustomData = {
  currency?: "ARS";
  value?: number;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: "product";
  contents?: MetaClientContentItem[];
  num_items?: number;
};

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    __seorinPixelInited?: boolean;
  }
}

const CONSENT_STORAGE_KEY = "seorin_cookie_consent_v1";
const TEST_CODE_SESSION_KEY = "seorin_meta_test_code";
export const CONSENT_CHANGE_EVENT = "seorin:consent-change";
export const CONSENT_OPEN_EVENT = "seorin:consent-open";

const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "1620993453105159").trim();

// Variables efímeras en memoria para no crear cookies publicitarias antes del consentimiento
let pendingFbclid: string | null = null;
let landingTimestampMs: number = Date.now();

export function captureLandingParamsInMemory(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid");
    if (fbclid && !pendingFbclid) {
      pendingFbclid = fbclid;
      landingTimestampMs = Date.now();
    }
    const testCode = params.get("test_event_code");
    if (testCode && /^TEST[A-Z0-9_]{2,32}$/i.test(testCode.trim())) {
      window.sessionStorage.setItem(TEST_CODE_SESSION_KEY, testCode.trim());
    }
  } catch {
    // Ignorar entornos con storage restringido
  }
}

function getActiveTestEventCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("test_event_code");
    if (fromUrl && /^TEST[A-Z0-9_]{2,32}$/i.test(fromUrl.trim())) {
      return fromUrl.trim();
    }
    const stored = window.sessionStorage.getItem(TEST_CODE_SESSION_KEY);
    if (stored && /^TEST[A-Z0-9_]{2,32}$/i.test(stored)) {
      return stored;
    }
  } catch {
    // noop
  }
  return undefined;
}

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === "granted" || val === "denied") return val;
  } catch {
    // noop
  }
  return null;
}

function clearMetaCookies(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const rootDomain = host.startsWith("www.") ? host.slice(4) : host;
  for (const name of ["_fbp", "_fbc"]) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${rootDomain}; SameSite=Lax`;
  }
}

export function setConsentStatus(status: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // noop
  }

  if (status === "granted") {
    ensureMetaPixelLoaded();
    window.fbq?.("consent", "grant");
  } else {
    window.fbq?.("consent", "revoke");
    clearMetaCookies();
  }

  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: status }));
}

export function openConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

function readBrowserCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      const v = rest.join("=").trim();
      if (v) return decodeURIComponent(v);
    }
  }
  return undefined;
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sl_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function ensureMetaPixelLoaded(): boolean {
  if (typeof window === "undefined" || !PIXEL_ID) return false;
  if (getConsentStatus() !== "granted") return false;

  if (!window.fbq) {
    const n: FbqFunction = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue?.push(args);
      }
    };
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    // Desactiva el auto-tracking de history.pushState para evitar PageView duplicados sin event_id al abrir modales
    n.disablePushState = true;
    window.fbq = n;
    if (!window._fbq) {
      window._fbq = n;
    }
  } else {
    window.fbq.disablePushState = true;
    if (window._fbq) window._fbq.disablePushState = true;
  }

  if (!document.getElementById("seorin-meta-pixel-js")) {
    const script = document.createElement("script");
    script.id = "seorin-meta-pixel-js";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  if (!window.__seorinPixelInited) {
    window.__seorinPixelInited = true;
    window.fbq("consent", "grant");
    window.fbq("init", PIXEL_ID);
  }

  return true;
}

async function waitForFbpCookie(maxWaitMs = 350): Promise<string | undefined> {
  const immediate = readBrowserCookie("_fbp");
  if (immediate) return immediate;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 50));
    const found = readBrowserCookie("_fbp");
    if (found) return found;
  }
  return readBrowserCookie("_fbp");
}

export function trackMetaStandardEvent(
  eventName: StorefrontMetaEvent,
  customData?: MetaClientCustomData,
  options?: { immediate?: boolean },
): string | null {
  if (typeof window === "undefined") return null;
  if (getConsentStatus() !== "granted") return null;
  if (!ensureMetaPixelLoaded()) return null;

  const eventId = generateEventId();
  const eventSourceUrl = window.location.href;
  const testEventCode = getActiveTestEventCode();

  // 1. Disparo en navegador (Meta Pixel) con eventID para deduplicación
  window.fbq?.("track", eventName, customData || {}, { eventID: eventId });

  // 2. Disparo en servidor (Conversions API) con el mismo event_id
  const dispatchToCapi = async () => {
    const fbp = options?.immediate ? readBrowserCookie("_fbp") : await waitForFbpCookie(350);
    let fbc = readBrowserCookie("_fbc");
    if (!fbc && pendingFbclid) {
      fbc = `fb.1.${landingTimestampMs}.${pendingFbclid}`;
    }

    const body = JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl,
      fbp,
      fbc,
      customData,
      ...(testEventCode ? { testEventCode } : {}),
    });

    try {
      await fetch("/api/meta/capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    } catch {
      // Fallo silencioso para jamás afectar la experiencia de compra del usuario
    }
  };

  void dispatchToCapi();
  return eventId;
}
