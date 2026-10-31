import crypto from "node:crypto";

export const META_GRAPH_VERSION = "v21.0";

export type MetaContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type MetaCustomData = {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: string;
  contents?: MetaContentItem[];
  num_items?: number;
  order_id?: string;
};

export type MetaCapiEventInput = {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  actionSource?: "website";
  userData: {
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
    emails?: string[];
    phones?: string[];
    externalIds?: string[];
    countryCode?: string;
  };
  customData?: MetaCustomData;
  testEventCode?: string;
};

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase(), "utf8").digest("hex");
}

export function normalizeAndHashEmail(rawEmail?: string): string[] | undefined {
  if (!rawEmail) return undefined;
  const normalized = rawEmail.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return undefined;
  return [sha256Hex(normalized)];
}

/**
 * Normaliza teléfonos (especialmente formato argentino con/sin 9 en WhatsApp)
 * y devuelve los hashes SHA-256 requeridos por Meta Conversions API.
 */
export function normalizeAndHashPhone(rawPhone?: string): string[] | undefined {
  if (!rawPhone) return undefined;
  let digits = rawPhone.replace(/\D+/g, "");
  digits = digits.replace(/^00+/, "");
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }
  if (digits.length < 7) return undefined;

  const variants = new Set<string>();

  if (digits.startsWith("549") && digits.length >= 12) {
    variants.add(digits);
    variants.add("54" + digits.slice(3));
  } else if (digits.startsWith("54") && digits.length >= 11) {
    variants.add(digits);
    variants.add("549" + digits.slice(2));
  } else if (digits.length === 10) {
    // Número local argentino de 10 dígitos (ej: 1123456789)
    variants.add("549" + digits);
    variants.add("54" + digits);
  } else {
    variants.add(digits);
  }

  return Array.from(variants).map((v) => sha256Hex(v));
}

export function extractCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      const val = rest.join("=").trim();
      if (val) return decodeURIComponent(val);
    }
  }
  return undefined;
}

export function extractClientIp(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || undefined;
}

export function sanitizeTestEventCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  const trimmed = code.trim();
  if (/^TEST[A-Z0-9_]{2,32}$/i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

export function safeTimingEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getMetaConfig() {
  const pixelId = (process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim();
  const accessToken = (process.env.META_CAPI_ACCESS_TOKEN || "").trim();
  const envTestCode = sanitizeTestEventCode(process.env.META_TEST_EVENT_CODE);
  return { pixelId, accessToken, envTestCode };
}

export async function sendMetaCapiEvent(input: MetaCapiEventInput): Promise<{
  ok: boolean;
  status: number;
  eventsReceived?: number;
  fbtraceId?: string;
  errorMessage?: string;
}> {
  const { pixelId, accessToken, envTestCode } = getMetaConfig();
  if (!pixelId || !accessToken) {
    return {
      ok: false,
      status: 503,
      errorMessage: "META_CAPI_NOT_CONFIGURED",
    };
  }

  const userDataPayload: Record<string, unknown> = {};
  if (input.userData.clientIpAddress) userDataPayload.client_ip_address = input.userData.clientIpAddress;
  if (input.userData.clientUserAgent) userDataPayload.client_user_agent = input.userData.clientUserAgent;
  if (input.userData.fbp) userDataPayload.fbp = input.userData.fbp;
  if (input.userData.fbc) userDataPayload.fbc = input.userData.fbc;
  if (input.userData.emails?.length) userDataPayload.em = input.userData.emails;
  if (input.userData.phones?.length) userDataPayload.ph = input.userData.phones;
  if (input.userData.externalIds?.length) userDataPayload.external_id = input.userData.externalIds;
  if (input.userData.countryCode) userDataPayload.country = [sha256Hex(input.userData.countryCode)];

  const eventPayload: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: input.actionSource ?? "website",
    user_data: userDataPayload,
  };

  if (input.eventSourceUrl) {
    eventPayload.event_source_url = input.eventSourceUrl;
  }

  if (input.customData && Object.keys(input.customData).length > 0) {
    eventPayload.custom_data = input.customData;
  }

  const body: Record<string, unknown> = {
    data: [eventPayload],
    access_token: accessToken,
  };

  const effectiveTestCode = sanitizeTestEventCode(input.testEventCode) || envTestCode;
  if (effectiveTestCode) {
    body.test_event_code = effectiveTestCode;
  }

  const endpoint = `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      events_received?: number;
      fbtrace_id?: string;
      error?: { message?: string; code?: number; fbtrace_id?: string };
    };

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        fbtraceId: json?.error?.fbtrace_id,
        errorMessage: json?.error?.message || "Meta Graph API error",
      };
    }

    return {
      ok: true,
      status: res.status,
      eventsReceived: json.events_received,
      fbtraceId: json.fbtrace_id,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      errorMessage: "Error de red al conectar con Meta Conversions API",
    };
  }
}
