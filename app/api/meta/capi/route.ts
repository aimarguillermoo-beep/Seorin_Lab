import { NextResponse } from "next/server";
import {
  extractClientIp,
  extractCookieValue,
  sanitizeTestEventCode,
  sendMetaCapiEvent,
  type MetaCustomData,
} from "@/lib/meta-server";

const ALLOWED_EVENTS = new Set(["PageView", "ViewContent", "AddToCart", "InitiateCheckout"] as const);
type AllowedBrowserEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = typeof payload.eventName === "string" ? payload.eventName : "";
  if (!ALLOWED_EVENTS.has(eventName as AllowedBrowserEvent)) {
    return NextResponse.json({ ok: false, error: "Unsupported event" }, { status: 400 });
  }

  const eventId = typeof payload.eventId === "string" ? payload.eventId.trim() : "";
  if (eventId.length < 6 || eventId.length > 128) {
    return NextResponse.json({ ok: false, error: "Invalid event_id" }, { status: 400 });
  }

  const eventSourceUrl =
    typeof payload.eventSourceUrl === "string" && payload.eventSourceUrl.startsWith("http")
      ? payload.eventSourceUrl.slice(0, 1000)
      : undefined;

  const cookieHeader = request.headers.get("cookie");
  const fbpRaw = typeof payload.fbp === "string" && payload.fbp.startsWith("fb.") ? payload.fbp.trim() : undefined;
  const fbcRaw = typeof payload.fbc === "string" && payload.fbc.startsWith("fb.") ? payload.fbc.trim() : undefined;

  const fbp = fbpRaw || extractCookieValue(cookieHeader, "_fbp");
  const fbc = fbcRaw || extractCookieValue(cookieHeader, "_fbc");
  const clientIpAddress = extractClientIp(request.headers);
  const clientUserAgent = request.headers.get("user-agent") || undefined;

  let customData: MetaCustomData | undefined;
  if (payload.customData && typeof payload.customData === "object") {
    const raw = payload.customData as Record<string, unknown>;
    customData = {};
    if (typeof raw.value === "number" && Number.isFinite(raw.value) && raw.value >= 0) {
      customData.value = Math.round(raw.value * 100) / 100;
      customData.currency = "ARS";
    } else if (raw.currency === "ARS") {
      customData.currency = "ARS";
    }
    if (Array.isArray(raw.content_ids)) {
      customData.content_ids = raw.content_ids
        .filter((x): x is string => typeof x === "string" && x.length > 0)
        .slice(0, 50);
    }
    if (typeof raw.content_name === "string" && raw.content_name) {
      customData.content_name = raw.content_name.slice(0, 200);
    }
    if (typeof raw.content_category === "string" && raw.content_category) {
      customData.content_category = raw.content_category.slice(0, 120);
    }
    if (typeof raw.content_type === "string" && raw.content_type) {
      customData.content_type = raw.content_type.slice(0, 40);
    }
    if (typeof raw.num_items === "number" && Number.isFinite(raw.num_items) && raw.num_items > 0) {
      customData.num_items = Math.floor(raw.num_items);
    }
    if (Array.isArray(raw.contents)) {
      customData.contents = raw.contents
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item) => ({
          id: typeof item.id === "string" ? item.id.slice(0, 120) : "",
          quantity: typeof item.quantity === "number" && item.quantity > 0 ? Math.floor(item.quantity) : 1,
          ...(typeof item.item_price === "number" && Number.isFinite(item.item_price)
            ? { item_price: Math.round(item.item_price * 100) / 100 }
            : {}),
        }))
        .filter((item) => item.id.length > 0)
        .slice(0, 50);
    }
  }

  const testEventCode = sanitizeTestEventCode(
    typeof payload.testEventCode === "string" ? payload.testEventCode : undefined,
  );

  const result = await sendMetaCapiEvent({
    eventName: eventName as AllowedBrowserEvent,
    eventId,
    eventSourceUrl,
    actionSource: "website",
    userData: {
      clientIpAddress,
      clientUserAgent,
      fbp,
      fbc,
    },
    customData,
    testEventCode,
  });

  if (!result.ok) {
    // Si CAPI aún no tiene token configurado en Vercel, devolvemos 202 silencioso para no ensuciar consola del cliente
    if (result.errorMessage === "META_CAPI_NOT_CONFIGURED") {
      return NextResponse.json({ ok: false, skipped: true }, { status: 202 });
    }
    return NextResponse.json({ ok: false, error: result.errorMessage }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    eventId,
    eventsReceived: result.eventsReceived ?? 1,
  });
}
