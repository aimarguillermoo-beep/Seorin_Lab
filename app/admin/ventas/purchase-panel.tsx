"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getEffectiveTransferPrice,
  isCyberDateActive,
  productSlug,
  products,
  type Product,
} from "@/app/products";

type PaymentMethod = "transfer" | "card";

type SelectedLine = {
  slug: string;
  product: Product;
  quantity: number;
};

type LocalPurchaseRecord = {
  orderId: string;
  value: number;
  eventId: string;
  createdAt: string;
  testMode: boolean;
};

const PASSWORD_SESSION_KEY = "seorin_admin_pw";
const HISTORY_STORAGE_KEY = "seorin_purchase_ledger_v1";

const formatARS = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(v);

function generateSuggestedOrderId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SL-${y}${m}${day}-${suffix}`;
}

export default function PurchasePanel() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [capiConfigured, setCapiConfigured] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
  const [selectedSlug, setSelectedSlug] = useState<string>(() => productSlug(products[0]));
  const [lines, setLines] = useState<SelectedLine[]>([]);
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualOverride, setManualOverride] = useState(false);

  const [orderId, setOrderId] = useState<string>(() => generateSuggestedOrderId());
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [confirmedPaid, setConfirmedPaid] = useState(false);

  const [testMode, setTestMode] = useState(false);
  const [testEventCode, setTestEventCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string } | null>(null);
  const [history, setHistory] = useState<LocalPurchaseRecord[]>([]);

  const cyberActive = useMemo(() => isCyberDateActive(), []);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory) as LocalPurchaseRecord[]);
      }
      const savedPw = window.sessionStorage.getItem(PASSWORD_SESSION_KEY);
      if (savedPw) {
        setPassword(savedPw);
        void verifyPassword(savedPw);
      }
    } catch {
      // noop
    }
  }, []);

  const unitPriceFor = (p: Product, method: PaymentMethod) =>
    method === "transfer" ? getEffectiveTransferPrice(p, cyberActive) : p.price;

  const calculatedTotal = useMemo(
    () => lines.reduce((sum, l) => sum + unitPriceFor(l.product, paymentMethod) * l.quantity, 0),
    [lines, paymentMethod, cyberActive],
  );

  useEffect(() => {
    if (!manualOverride) {
      setManualAmount(calculatedTotal > 0 ? String(calculatedTotal) : "");
    }
  }, [calculatedTotal, manualOverride]);

  async function verifyPassword(pwToTest: string) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/meta/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwToTest, action: "verify" }),
      });
      const data = (await res.json()) as { ok?: boolean; capiConfigured?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setAuthenticated(false);
        setAuthError(data.error || "No se pudo verificar el acceso.");
        return;
      }
      setAuthenticated(true);
      setCapiConfigured(Boolean(data.capiConfigured));
      window.sessionStorage.setItem(PASSWORD_SESSION_KEY, pwToTest);
    } catch {
      setAuthError("Error de conexión con el servidor.");
    } finally {
      setAuthLoading(false);
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    void verifyPassword(password.trim());
  };

  const addProductLine = () => {
    const found = products.find((p) => productSlug(p) === selectedSlug);
    if (!found) return;
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === selectedSlug);
      if (existing) {
        return prev.map((l) => (l.slug === selectedSlug ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { slug: selectedSlug, product: found, quantity: 1 }];
    });
  };

  const updateLineQty = (slug: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.slug === slug ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const normalizedId = orderId.trim().toUpperCase().replace(/\s+/g, "-");
    const finalValue = Number(manualAmount);

    if (!testMode && history.some((h) => !h.testMode && h.orderId === normalizedId)) {
      setFeedback({
        type: "err",
        message: `El pedido ${normalizedId} ya figura registrado en este navegador. Usá un ID único por venta.`,
      });
      return;
    }

    if (!Number.isFinite(finalValue) || finalValue <= 0) {
      setFeedback({ type: "err", message: "Ingresá un importe real válido en ARS mayor a 0." });
      return;
    }

    setSubmitting(true);
    try {
      const itemsPayload = lines.map((l) => ({
        id: l.slug,
        quantity: l.quantity,
        item_price: unitPriceFor(l.product, paymentMethod),
      }));

      const res = await fetch("/api/meta/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmedPaid,
          orderId: normalizedId,
          value: finalValue,
          customerPhone,
          customerEmail,
          items: itemsPayload,
          testMode,
          testEventCode: testMode ? testEventCode.trim() : undefined,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        orderId?: string;
        eventId?: string;
        value?: number;
        eventsReceived?: number;
      };

      if (!res.ok || !data.ok) {
        setFeedback({ type: "err", message: data.error || "Error al registrar Purchase en Meta." });
        return;
      }

      const newRecord: LocalPurchaseRecord = {
        orderId: data.orderId || normalizedId,
        value: data.value || finalValue,
        eventId: data.eventId || "",
        createdAt: new Date().toLocaleString("es-AR"),
        testMode,
      };
      const updated = [newRecord, ...history].slice(0, 30);
      setHistory(updated);
      try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // noop
      }

      setFeedback({
        type: "ok",
        message: testMode
          ? `Evento Purchase de PRUEBA enviado a Meta (${formatARS(finalValue)} · ID: ${newRecord.orderId} · event_id: ${newRecord.eventId}). Revisalo en «Probar eventos».`
          : `Compra real registrada en Meta Conversions API (${formatARS(finalValue)} · Pedido: ${newRecord.orderId} · event_id: ${newRecord.eventId}).`,
      });

      setLines([]);
      setManualOverride(false);
      setManualAmount("");
      setCustomerPhone("");
      setCustomerEmail("");
      setConfirmedPaid(false);
      setOrderId(generateSuggestedOrderId());
    } catch {
      setFeedback({ type: "err", message: "Error de red al conectar con el servidor." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#fbf8f4] text-[#171311] flex items-center justify-center p-6">
        <div className="w-full max-w-[420px] rounded-[18px] border border-[rgba(23,19,17,0.17)] bg-white p-8 shadow-sm">
          <p className="m-0 text-[10px] font-extrabold tracking-[0.16em] uppercase text-[#776a63]">
            SEORIN LAB · USO INTERNO
          </p>
          <h1 className="mt-2 mb-3 font-serif text-[28px] font-normal tracking-[-0.02em] leading-tight">
            Confirmación de Ventas (Meta CAPI)
          </h1>
          <p className="mb-6 text-[13px] leading-relaxed text-[#5d534e]">
            Acceso restringido para registrar compras con pago efectivamente acreditado.
          </p>
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6c625c]">
              Clave de administrador
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-[10px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3.5 text-[14px] font-normal tracking-normal text-[#171311]"
                placeholder="Ingresá META_ADMIN_PASSWORD"
              />
            </label>
            {authError && <p className="m-0 text-[12px] font-semibold text-[#a83232]">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="h-11 cursor-pointer rounded-full bg-[#171311] text-[12px] font-bold text-white disabled:opacity-50"
            >
              {authLoading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f4] text-[#171311] py-10 px-4 sm:px-8">
      <div className="mx-auto max-w-[780px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(23,19,17,0.17)] pb-5">
          <div>
            <p className="m-0 text-[10px] font-extrabold tracking-[0.16em] uppercase text-[#776a63]">
              SEORIN LAB · CONVERSIONS API
            </p>
            <h1 className="mt-1 mb-0 font-serif text-[30px] font-normal tracking-[-0.02em]">
              Registrar Compra Confirmada (Purchase)
            </h1>
          </div>
          <a href="/" className="text-[12px] font-bold underline">
            ← Volver a la tienda
          </a>
        </div>

        {!capiConfigured && (
          <div className="mb-6 rounded-[12px] border border-[#d69e2e] bg-[#fefcbf] p-4 text-[13px] text-[#744210]">
            Falta configurar <code>META_CAPI_ACCESS_TOKEN</code> en las variables de entorno del servidor (Vercel).
          </div>
        )}

        <form
          onSubmit={handleSubmitPurchase}
          className="rounded-[18px] border border-[rgba(23,19,17,0.17)] bg-white p-6 sm:p-8 shadow-sm flex flex-col gap-6"
        >
          {/* Modo Producción vs Prueba Controlada */}
          <div className="flex flex-col gap-3 rounded-[12px] bg-[#f5f0ea] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong className="text-[13px]">Modo de envío</strong>
                <p className="m-0 text-[12px] text-[#5d534e]">
                  Usá «Prueba controlada» para verificar en «Probar eventos» de Meta sin generar ventas reales.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTestMode(false)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-bold ${
                    !testMode ? "bg-[#171311] text-white" : "border border-[rgba(23,19,17,0.2)] bg-white text-[#171311]"
                  }`}
                >
                  Venta real
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode(true)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-bold ${
                    testMode ? "bg-[#a85862] text-white" : "border border-[rgba(23,19,17,0.2)] bg-white text-[#171311]"
                  }`}
                >
                  Prueba controlada
                </button>
              </div>
            </div>
            {testMode && (
              <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
                Código de prueba de Meta (pestaña «Probar eventos»)
                <input
                  type="text"
                  value={testEventCode}
                  onChange={(e) => setTestEventCode(e.target.value)}
                  placeholder="Ej: TEST12345"
                  required={testMode}
                  className="h-10 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-white px-3 text-[13px] font-normal tracking-normal text-[#171311]"
                />
              </label>
            )}
          </div>

          {/* ID de pedido y medio de pago */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
              ID único del pedido
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  className="h-10 flex-1 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[13px] font-normal tracking-normal text-[#171311]"
                />
                <button
                  type="button"
                  onClick={() => setOrderId(generateSuggestedOrderId())}
                  className="cursor-pointer rounded-[8px] border border-[rgba(23,19,17,0.2)] px-3 text-[11px] font-bold"
                >
                  Nuevo
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
              Condición de precio aplicada
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="h-10 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[13px] font-normal tracking-normal text-[#171311]"
              >
                <option value="transfer">
                  Transferencia vigente {cyberActive ? "(Cyber Skin Days activo)" : ""}
                </option>
                <option value="card">Tarjeta / Precio de lista</option>
              </select>
            </label>
          </div>

          {/* Selector de productos */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
              Productos incluidos en la compra
            </span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="h-10 flex-1 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[13px] text-[#171311]"
              >
                {products.map((p) => {
                  const s = productSlug(p);
                  const unit = unitPriceFor(p, paymentMethod);
                  return (
                    <option key={s} value={s}>
                      {p.brand} — {p.name} ({formatARS(unit)})
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={addProductLine}
                className="h-10 cursor-pointer rounded-[8px] bg-[#171311] px-4 text-[12px] font-bold text-white"
              >
                + Agregar producto
              </button>
            </div>

            {lines.length > 0 && (
              <div className="mt-1 divide-y divide-[rgba(23,19,17,0.12)] rounded-[10px] border border-[rgba(23,19,17,0.15)] bg-[#fbf8f4] px-3.5">
                {lines.map((l) => {
                  const unit = unitPriceFor(l.product, paymentMethod);
                  return (
                    <div key={l.slug} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                      <div>
                        <strong>{l.product.name}</strong>
                        <span className="ml-2 text-[12px] text-[#6c625c]">
                          {formatARS(unit)} c/u
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateLineQty(l.slug, -1)}
                          className="h-7 w-7 cursor-pointer rounded-full border border-[rgba(23,19,17,0.2)] bg-white font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold">{l.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateLineQty(l.slug, 1)}
                          className="h-7 w-7 cursor-pointer rounded-full border border-[rgba(23,19,17,0.2)] bg-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Importe real cobrado */}
          <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
            Importe real efectivamente cobrado (ARS)
            <input
              type="number"
              min="1"
              step="1"
              value={manualAmount}
              onChange={(e) => {
                setManualOverride(true);
                setManualAmount(e.target.value);
              }}
              placeholder="Ej: 44900"
              required
              className="h-11 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[16px] font-bold tracking-normal text-[#171311]"
            />
            {manualOverride && calculatedTotal > 0 && (
              <button
                type="button"
                onClick={() => setManualOverride(false)}
                className="self-start cursor-pointer border-0 bg-transparent p-0 text-[11px] underline text-[#5d534e]"
              >
                Restaurar suma automática ({formatARS(calculatedTotal)})
              </button>
            )}
          </label>

          {/* Datos del cliente (hasheados con SHA-256 en servidor) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
              WhatsApp / Teléfono del comprador
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: +54 9 11 2345 6789"
                className="h-10 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[13px] font-normal tracking-normal text-[#171311]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c625c]">
              Email del comprador (opcional si hay teléfono)
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="h-10 rounded-[8px] border border-[rgba(23,19,17,0.2)] bg-[#fbf8f4] px-3 text-[13px] font-normal tracking-normal text-[#171311]"
              />
            </label>
          </div>
          <p className="-mt-3 m-0 text-[11px] text-[#776a63]">
            Privacidad: el teléfono/email se convierte en hash criptográfico SHA-256 antes de enviarse a Meta Ads para atribuir la campaña y no se almacena en ninguna base de datos.
          </p>

          {/* Confirmación explícita */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-[10px] border border-[rgba(23,19,17,0.15)] bg-[#fbf8f4] p-3.5 text-[12.5px] leading-snug">
            <input
              type="checkbox"
              checked={confirmedPaid}
              onChange={(e) => setConfirmedPaid(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 accent-[#171311]"
            />
            <span>
              Confirmo que el pago de esta operación ya fue <strong>efectivamente acreditado</strong> (o que estoy ejecutando una prueba controlada con código TEST).
            </span>
          </label>

          {feedback && (
            <div
              className={`rounded-[10px] p-3.5 text-[13px] font-medium ${
                feedback.type === "ok"
                  ? "border border-[#416751] bg-[#eef5f0] text-[#284534]"
                  : "border border-[#c53030] bg-[#fff5f5] text-[#9b2c2c]"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 cursor-pointer rounded-full bg-[#171311] text-[13px] font-bold text-white disabled:opacity-50"
          >
            {submitting
              ? "Enviando evento a Meta..."
              : testMode
                ? "Enviar Purchase de PRUEBA a Meta"
                : "Registrar Purchase confirmado en Meta"}
          </button>
        </form>

        {history.length > 0 && (
          <section className="mt-8 rounded-[18px] border border-[rgba(23,19,17,0.17)] bg-white p-6">
            <h2 className="m-0 mb-3 font-serif text-[20px] font-normal">
              Últimos envíos registrados en este navegador
            </h2>
            <div className="divide-y divide-[rgba(23,19,17,0.1)] text-[12.5px]">
              {history.map((h, i) => (
                <div key={`${h.eventId}_${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <strong>{h.orderId}</strong> · {formatARS(h.value)}
                    {h.testMode && (
                      <span className="ml-2 rounded bg-[#a85862] px-1.5 py-0.5 text-[10px] font-bold text-white">
                        PRUEBA
                      </span>
                    )}
                  </div>
                  <div className="text-[#6c625c]">
                    {h.createdAt} · <code className="text-[11px]">{h.eventId}</code>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
