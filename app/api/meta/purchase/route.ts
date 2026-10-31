import { NextResponse } from "next/server";
import {
  getMetaConfig,
  normalizeAndHashEmail,
  normalizeAndHashPhone,
  safeTimingEqual,
  sanitizeTestEventCode,
  sendMetaCapiEvent,
  sha256Hex,
  type MetaContentItem,
} from "@/lib/meta-server";

// Registro en memoria de instancia para bloquear reenvíos accidentales del mismo ID de pedido en producción
const registeredOrderIds = new Set<string>();

export async function POST(request: Request) {
  const adminPassword = (process.env.META_ADMIN_PASSWORD || "").trim();
  const { pixelId, accessToken } = getMetaConfig();

  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Falta configurar META_ADMIN_PASSWORD en las variables de entorno del servidor." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Formato JSON inválido." }, { status: 400 });
  }

  const providedPassword = typeof body.password === "string" ? body.password.trim() : "";
  if (!providedPassword || !safeTimingEqual(providedPassword, adminPassword)) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta." }, { status: 401 });
  }

  if (body.action === "verify") {
    return NextResponse.json({
      ok: true,
      capiConfigured: Boolean(pixelId && accessToken),
    });
  }

  if (!pixelId || !accessToken) {
    return NextResponse.json(
      { ok: false, error: "Falta configurar META_CAPI_ACCESS_TOKEN o NEXT_PUBLIC_META_PIXEL_ID en el servidor." },
      { status: 503 },
    );
  }

  if (body.confirmedPaid !== true) {
    return NextResponse.json(
      { ok: false, error: "Solo se pueden registrar compras con pago efectivamente confirmado." },
      { status: 400 },
    );
  }

  const rawOrderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const normalizedOrderId = rawOrderId.toUpperCase().replace(/\s+/g, "-");
  if (!/^[A-Z0-9_-]{3,64}$/.test(normalizedOrderId)) {
    return NextResponse.json(
      { ok: false, error: "Ingresá un ID único de pedido válido (3 a 64 caracteres alfanuméricos, ej: SL-20261031-01)." },
      { status: 400 },
    );
  }

  const value = typeof body.value === "number" ? body.value : Number(body.value);
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json(
      { ok: false, error: "El importe real de la compra debe ser mayor a 0 ARS." },
      { status: 400 },
    );
  }

  const testMode = body.testMode === true;
  const testEventCode = sanitizeTestEventCode(
    typeof body.testEventCode === "string" ? body.testEventCode : undefined,
  );

  if (testMode && !testEventCode) {
    return NextResponse.json(
      {
        ok: false,
        error: "Para enviar una compra en modo prueba controlada debés ingresar el código TEST de Meta (ej: TEST12345).",
      },
      { status: 400 },
    );
  }

  if (!testMode && registeredOrderIds.has(normalizedOrderId)) {
    return NextResponse.json(
      { ok: false, error: `El pedido ${normalizedOrderId} ya fue registrado previamente.` },
      { status: 409 },
    );
  }

  const rawPhone = typeof body.customerPhone === "string" ? body.customerPhone : undefined;
  const rawEmail = typeof body.customerEmail === "string" ? body.customerEmail : undefined;
  const phones = normalizeAndHashPhone(rawPhone);
  const emails = normalizeAndHashEmail(rawEmail);

  if (!phones?.length && !emails?.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "Ingresá al menos el teléfono de WhatsApp o el email del comprador (se envía hasheado con SHA-256 para atribución en Meta Ads).",
      },
      { status: 400 },
    );
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const contents: MetaContentItem[] = rawItems
    .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
    .map((x) => ({
      id: typeof x.id === "string" ? x.id.slice(0, 120) : "",
      quantity: typeof x.quantity === "number" && x.quantity > 0 ? Math.floor(x.quantity) : 1,
      ...(typeof x.item_price === "number" && Number.isFinite(x.item_price) && x.item_price >= 0
        ? { item_price: Math.round(x.item_price * 100) / 100 }
        : {}),
    }))
    .filter((x) => x.id.length > 0);

  const numItems = contents.reduce((acc, item) => acc + item.quantity, 0);
  const eventId = testMode ? `test_purchase_${normalizedOrderId}_${Date.now()}` : `purchase_${normalizedOrderId}`;

  const origin = request.headers.get("origin") || "https://www.seorinlab.com.ar";

  const result = await sendMetaCapiEvent({
    eventName: "Purchase",
    eventId,
    eventSourceUrl: origin,
    actionSource: "website",
    userData: {
      phones,
      emails,
      externalIds: [sha256Hex(normalizedOrderId)],
      countryCode: "ar",
    },
    customData: {
      currency: "ARS",
      value: Math.round(value * 100) / 100,
      order_id: normalizedOrderId,
      ...(contents.length > 0
        ? {
            content_type: "product",
            content_ids: contents.map((c) => c.id),
            contents,
            num_items: numItems,
          }
        : {}),
    },
    testEventCode: testMode ? testEventCode : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.errorMessage || "Meta rechazó el evento Purchase." },
      { status: result.status },
    );
  }

  if (!testMode) {
    registeredOrderIds.add(normalizedOrderId);
  }

  return NextResponse.json({
    ok: true,
    eventId,
    orderId: normalizedOrderId,
    value: Math.round(value * 100) / 100,
    currency: "ARS",
    testMode,
    eventsReceived: result.eventsReceived ?? 1,
    fbtraceId: result.fbtraceId,
  });
}
