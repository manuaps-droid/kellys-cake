"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { submitCateringRequest } from "../actions/catering.actions";
import { getCoffeeBreakItemsAction } from "../actions/get-coffee-break.action";
import {
  loadCateringPending,
  saveCateringPending,
  clearCateringPending,
  type CateringPending,
} from "../lib/catering-link";

import type {
  CoffeeBreakItem,
} from "../repositories/get-coffee-break.repository";

const eventTypes = [
  { value: "cumpleanos", label: "🎂 Cumpleaños", description: "Fiesta infantil, quinceañero, adultos" },
  { value: "corporativo", label: "🏢 Corporativo", description: "Coffee break, evento empresarial" },
  { value: "otro", label: "🎉 Otro evento", description: "Boda, baby shower, aniversario" },
];

const budgetRanges = [
  "Menos de S/ 300",
  "S/ 300 - S/ 600",
  "S/ 600 - S/ 1,000",
  "S/ 1,000 - S/ 2,000",
  "Más de S/ 2,000",
  "No estoy seguro",
];

const EXTRAS_FIELDS = [
  { key: "cupcakes", label: "🧁 Cupcakes personalizados", placeholder: "Ej: 12 unidades" },
  { key: "cakepops", label: "🍭 Cake pops personalizados", placeholder: "Ej: 20 unidades" },
  { key: "galletas", label: "🍪 Galletas personalizadas", placeholder: "Ej: 15 unidades" },
] as const;

type ExtrasKey = (typeof EXTRAS_FIELDS)[number]["key"];

export default function CateringForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);

  // Los pedidos se programan con mínimo 5 días de anticipación
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantPersonalizedCake, setWantPersonalizedCake] = useState(false);
  const [pendingCake, setPendingCake] = useState<CateringPending | null>(null);

  // Extras: cantidades de cupcakes / cakepops / galletas (texto libre)
  const [extras, setExtras] = useState<Record<ExtrasKey, string>>({
    cupcakes: "",
    cakepops: "",
    galletas: "",
  });

  // Coffee break: items desde BD + cantidades que pide el usuario
  const [coffeeBreakItems, setCoffeeBreakItems] = useState<CoffeeBreakItem[]>([]);
  const [coffeeBreakQtys, setCoffeeBreakQtys] = useState<Record<string, number>>({});
  const [coffeeBreakLoading, setCoffeeBreakLoading] = useState(true);

  useEffect(() => {
    // Cargar items de coffee break
    void getCoffeeBreakItemsAction().then(({ items }) => {
      setCoffeeBreakItems(items);
      setCoffeeBreakLoading(false);
    });
  }, []);

  // Cargar sesión pendiente (puede traer un pastel personalizado ya creado)
  useEffect(() => {
    const pending = loadCateringPending();
    if (!pending) return;
    setPendingCake(pending);
    setWantPersonalizedCake(true);

    if (pending.tipo_evento) setSelectedType(pending.tipo_evento);
    if (pending.presupuesto) setSelectedBudget(pending.presupuesto);

    // Precargar inputs en el siguiente tick (form ya montado)
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      const setField = (name: string, value: string) => {
        const el = form.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
        if (el && value) el.value = value;
      };
      setField("nombre", pending.nombre);
      setField("email", pending.email);
      setField("celular", pending.celular);
      setField("fecha_evento", pending.fecha_evento);
      setField(
        "num_invitados",
        pending.num_invitados ? String(pending.num_invitados) : ""
      );
      // Restaurar extras desde descripcion (parseo simple)
      const desc = pending.descripcion ?? "";
      for (const f of EXTRAS_FIELDS) {
        const re = new RegExp(`${f.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(.+?)(?:\\n|$)`, "i");
        const m = desc.match(re);
        if (m) setExtras((prev) => ({ ...prev, [f.key]: m[1].trim() }));
      }
      // Combinar descripción original con resumen del pastel
      let descripcion = desc;
      if (pending.pastel_resumen) {
        descripcion =
          (descripcion ? descripcion + "\n\n" : "") +
          "🍰 Pastel personalizado adjuntado:\n" +
          pending.pastel_resumen;
      }
      setField("descripcion", descripcion);
    });
  }, []);

  // Calcular total estimado del coffee break (solo items con precio + cantidad)
  const coffeeBreakTotal = coffeeBreakItems.reduce((sum, item) => {
    const qty = coffeeBreakQtys[item.id] ?? 0;
    if (qty <= 0 || !item.precio) return sum;
    return sum + qty * item.precio;
  }, 0);

  function buildExtrasBlock(): string {
    const lines: string[] = [];
    for (const f of EXTRAS_FIELDS) {
      const v = extras[f.key].trim();
      if (v) lines.push(`${f.label}: ${v}`);
    }
    return lines.join("\n");
  }

  function buildCoffeeBreakBlock(): string {
    if (coffeeBreakItems.length === 0) return "";
    const lines: string[] = [];
    let subtotal = 0;
    for (const item of coffeeBreakItems) {
      const qty = coffeeBreakQtys[item.id] ?? 0;
      if (qty <= 0) continue;
      const precio = item.precio ?? 0;
      const lineTotal = qty * precio;
      subtotal += lineTotal;
      lines.push(`  • ${item.nombre} — ${qty} x S/ ${precio.toFixed(2)} = S/ ${lineTotal.toFixed(2)}`);
    }
    if (lines.length === 0) return "";
    return `🥐 Coffee break:\n${lines.join("\n")}\n   Subtotal coffee break: S/ ${subtotal.toFixed(2)}`;
  }

  function handleSubmitBuilder(formData: FormData) {
    const baseDescripcion = (formData.get("descripcion") as string) || "";

    const extrasBlock = buildExtrasBlock();
    const coffeeBlock = buildCoffeeBreakBlock();

    let descripcionFinal = baseDescripcion;
    if (extrasBlock && !baseDescripcion.includes("Cupcakes") && !baseDescripcion.includes("Cake pops") && !baseDescripcion.includes("Galletas")) {
      descripcionFinal = (descripcionFinal ? descripcionFinal + "\n\n" : "") + "🧁 Extras personalizados:\n" + extrasBlock;
    }
    if (coffeeBlock && !baseDescripcion.includes("Coffee break")) {
      descripcionFinal = (descripcionFinal ? descripcionFinal + "\n\n" : "") + coffeeBlock;
    }
    if (pendingCake?.pastel_resumen && !baseDescripcion.includes("Pastel personalizado adjuntado")) {
      descripcionFinal =
        (descripcionFinal ? descripcionFinal + "\n\n" : "") +
        "🍰 Pastel personalizado adjuntado:\n" +
        pendingCake.pastel_resumen;
    }

    return descripcionFinal;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const descripcionFinal = handleSubmitBuilder(formData);

      const data = {
        tipo_evento: selectedType,
        nombre: formData.get("nombre") as string,
        email: formData.get("email") as string,
        celular: formData.get("celular") as string,
        fecha_evento: formData.get("fecha_evento") as string,
        num_invitados: parseInt(formData.get("num_invitados") as string) || 0,
        descripcion: descripcionFinal,
        presupuesto: selectedBudget,
        proyecto_id: pendingCake?.proyecto_id,
      };

      if (!data.tipo_evento || !data.nombre || !data.email || !data.celular || !data.fecha_evento || !data.descripcion) {
        const faltantes: string[] = [];
        if (!data.tipo_evento) faltantes.push("tipo de evento");
        if (!data.nombre) faltantes.push("nombre");
        if (!data.email) faltantes.push("correo");
        if (!data.celular) faltantes.push("celular");
        if (!data.fecha_evento) faltantes.push("fecha del evento");
        if (!data.descripcion) faltantes.push("descripción del evento");
        setError(
          faltantes.length
            ? `Te falta completar: ${faltantes.join(", ")}. Complétalos para enviar tu cotización.`
            : "Por favor completa todos los campos obligatorios."
        );
        return;
      }

      if (data.fecha_evento < minDate) {
        setError(`La fecha del evento debe ser con mínimo 5 días de anticipación (a partir del ${minDate}).`);
        return;
      }

      const result = await submitCateringRequest(data);

      if (!result.success) {
        setError(result.message || "Error al enviar la solicitud.");
        return;
      }

      // Limpiar bandera de catering
      clearCateringPending();
      setPendingCake(null);
      setWantPersonalizedCake(false);
      setExtras({ cupcakes: "", cakepops: "", galletas: "" });
      setCoffeeBreakQtys({});

      setSuccess(true);
      formRef.current?.reset();
      setSelectedType("");
      setSelectedBudget("");
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  function goToPersonalizar() {
    // Capturar datos del form antes de salir
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    // Construir descripción pre-personalizar (incluye extras + coffee break)
    const extrasBlock = buildExtrasBlock();
    const coffeeBlock = buildCoffeeBreakBlock();
    let descSaved = (fd.get("descripcion") as string) ?? "";
    if (extrasBlock) {
      descSaved = (descSaved ? descSaved + "\n\n" : "") + "🧁 Extras personalizados:\n" + extrasBlock;
    }
    if (coffeeBlock) {
      descSaved = (descSaved ? descSaved + "\n\n" : "") + coffeeBlock;
    }
    const pending: CateringPending = {
      tipo_evento: selectedType,
      nombre: (fd.get("nombre") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      celular: (fd.get("celular") as string) ?? "",
      fecha_evento: (fd.get("fecha_evento") as string) ?? "",
      num_invitados: parseInt((fd.get("num_invitados") as string) || "0") || 0,
      descripcion: descSaved,
      presupuesto: selectedBudget,
    };
    if (pendingCake?.proyecto_id) pending.proyecto_id = pendingCake.proyecto_id;
    if (pendingCake?.pastel_resumen) pending.pastel_resumen = pendingCake.pastel_resumen;
    saveCateringPending(pending);
    router.push("/personalizar/nuevo?from=catering");
  }

  if (success) {
    return (
      <section id="cotizar" className="bg-kc-cream py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-3xl border border-kc-sand bg-white p-12 shadow-lg">
            <div className="text-6xl">🎉</div>
            <h2 className="mt-6 font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
              ¡Solicitud enviada!
            </h2>
            <p className="mt-4 text-kc-mocha">
              Hemos recibido tu solicitud de catering{pendingCake?.proyecto_id ? " con tu pastel personalizado adjuntado" : ""}. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas con una cotización.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-8 rounded-full bg-kc-charcoal px-8 py-3 text-sm font-semibold text-kc-cream transition-all hover:bg-kc-deep"
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cotizar" className="bg-kc-cream py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-kc-rose-gold">
            Cotización gratuita
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kc-charcoal md:text-5xl">
            Cuéntanos tu idea
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-kc-mocha">
            Completa el formulario y te enviaremos una cotización personalizada en menos de 24 horas.
          </p>
        </div>

        {pendingCake?.proyecto_id && (
          <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-semibold">¡Tu pastel personalizado está listo!</p>
                {pendingCake.pastel_resumen && (
                  <p className="mt-1 whitespace-pre-wrap text-emerald-700">
                    {pendingCake.pastel_resumen}
                  </p>
                )}
                <p className="mt-3 rounded-xl bg-white/70 p-3 text-emerald-800">
                  <span className="font-semibold">Continúa con tu cotización:</span>{" "}
                  agrega cupcakes, cake pops, galletas o productos del catálogo coffee break
                  más abajo. Cuando estés conforme con todo, envía tu solicitud.
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Si quieres editarlo, vuelve a personalizar. Si quieres quitarlo, desmarca la opción "Agregar un pastel personalizado".
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="overflow-hidden rounded-3xl border-kc-sand/50 shadow-xl">
          <div className="bg-gradient-to-r from-kc-charcoal to-kc-deep p-6 text-center">
            <h3 className="text-lg font-semibold text-kc-cream">Solicitud de Catering</h3>
            <p className="mt-1 text-sm text-kc-cream/60">Todos los campos con * son obligatorios</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Event Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de evento *</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                      selectedType === type.value
                        ? "border-kc-rose-gold bg-kc-rose-gold/5 shadow-md"
                        : "border-kc-sand bg-white hover:border-kc-blush hover:shadow-sm"
                    }`}
                  >
                    <span className="text-2xl">{type.label.split(" ")[0]}</span>
                    <p className="mt-2 text-sm font-semibold text-kc-charcoal">
                      {type.label.split(" ").slice(1).join(" ")}
                    </p>
                    <p className="mt-1 text-xs text-kc-mocha">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input id="nombre" name="nombre" placeholder="Tu nombre" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Celular *</Label>
                <Input id="celular" name="celular" type="tel" placeholder="987 654 321" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_evento">Fecha del evento *</Label>
                <Input
                  id="fecha_evento"
                  name="fecha_evento"
                  type="date"
                  min={minDate}
                  required
                />
                <p className="text-xs text-kc-mocha">
                  Los pedidos se programan con mínimo 5 días de anticipación (a partir del {minDate}).
                </p>
              </div>
            </div>

            {/* Number of guests */}
            <div className="space-y-2">
              <Label htmlFor="num_invitados">Número aproximado de invitados *</Label>
              <Input id="num_invitados" name="num_invitados" type="number" min="1" placeholder="50" required />
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Presupuesto estimado</Label>
              <div className="flex flex-wrap gap-2">
                {budgetRanges.map((budget) => (
                  <button
                    key={budget}
                    type="button"
                    onClick={() => setSelectedBudget(budget)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selectedBudget === budget
                        ? "border-kc-rose-gold bg-kc-rose-gold text-white"
                        : "border-kc-sand bg-white text-kc-charcoal hover:border-kc-blush"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripcion */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Cuéntanos tu idea *</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={5}
                required
                placeholder="Describe el evento que tienes en mente: temática, colores, tipo de postres, cantidad de personas, ideas de decoración..."
                className="w-full rounded-xl border border-kc-sand bg-white px-4 py-3 text-sm outline-none transition placeholder:text-kc-mocha/50 focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
              />
            </div>

            {/* Opcion de personalizar pastel */}
            <div className="rounded-2xl border-2 border-dashed border-kc-rose-gold/40 bg-kc-rose-gold/5 p-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantPersonalizedCake}
                  onChange={(e) => {
                    setWantPersonalizedCake(e.target.checked);
                    if (!e.target.checked && pendingCake) {
                      clearCateringPending();
                      setPendingCake(null);
                    }
                  }}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-kc-rose-gold focus:ring-kc-rose-gold"
                />
                <div>
                  <span className="font-semibold text-kc-charcoal">
                    Agregar un pastel personalizado
                  </span>
                  <p className="mt-1 text-sm text-kc-mocha">
                    {pendingCake?.proyecto_id
                      ? "Ya tienes un pastel adjuntado. Puedes volver a personalizarlo o enviar la cotización tal cual."
                      : "Si quieres complementar tu servicio de catering con un pastel diseñado especialmente para tu evento, diseñalo paso a paso con nuestro personalizador. Al terminar, volverás aquí con el pastel adjuntado."}
                  </p>
                </div>
              </label>

              {wantPersonalizedCake && (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    onClick={goToPersonalizar}
                    className="rounded-full bg-kc-charcoal px-8 py-3 text-sm font-semibold text-kc-cream transition-all hover:bg-kc-deep hover:shadow-xl"
                  >
                    {pendingCake?.proyecto_id
                      ? "🎨 Volver a personalizar el pastel"
                      : "Diseñar mi pastel personalizado"}
                  </Button>
                </div>
              )}
            </div>

            {/* EXTRAS PERSONALIZADOS (cantidades) */}
            <div className="rounded-2xl border border-kc-blush/40 bg-kc-blush/5 p-6">
              <h3 className="text-base font-semibold text-kc-charcoal">
                🧁 Extras según la temática
              </h3>
              <p className="mt-1 text-xs text-kc-mocha">
                Indica cuántas unidades necesitas de cada uno para acompañar tu evento. La decoración se ajustará a la temática del pastel.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {EXTRAS_FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label htmlFor={`extra-${f.key}`} className="text-xs font-medium text-kc-charcoal">
                      {f.label}
                    </label>
                    <input
                      id={`extra-${f.key}`}
                      type="text"
                      inputMode="numeric"
                      value={extras[f.key]}
                      onChange={(e) =>
                        setExtras((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-kc-sand bg-white px-3 py-2 text-sm outline-none focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* COFFEE BREAK (solo productos del catálogo) */}
            <div className="rounded-2xl border border-kc-gold/40 bg-kc-gold/5 p-6">
              {coffeeBreakTotal > 0 && (
                <div className="mb-4 flex justify-end">
                  <div className="shrink-0 rounded-full bg-kc-charcoal px-4 py-2 text-sm font-semibold text-kc-cream">
                    Subtotal: S/ {coffeeBreakTotal.toFixed(2)}
                  </div>
                </div>
              )}

              {coffeeBreakLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl border border-kc-sand bg-white/60"
                    />
                  ))}
                </div>
              ) : coffeeBreakItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-kc-sand bg-white/60 p-6 text-center text-sm text-kc-mocha">
                  Aún no hay productos de coffee break disponibles.
                </div>
              ) : (
                <div className="space-y-3">
                  {coffeeBreakItems.map((item) => {
                      const qty = coffeeBreakQtys[item.id] ?? 0;
                      const lineTotal = qty > 0 && item.precio ? qty * item.precio : 0;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-kc-sand bg-white p-4 transition hover:border-kc-rose-gold/50"
                        >
                          <div className="flex-1 min-w-[200px]">
                            <p className="text-sm font-semibold text-kc-charcoal">{item.nombre}</p>
                            {item.descripcion && (
                              <p className="mt-0.5 text-xs text-kc-mocha">{item.descripcion}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-kc-rose-gold">
                              S/ {item.precio ? item.precio.toFixed(2) : "—"}
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-kc-mocha">unitario</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setCoffeeBreakQtys((prev) => ({
                                  ...prev,
                                  [item.id]: Math.max(0, qty - 1),
                                }))
                              }
                              disabled={qty === 0}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-kc-sand text-kc-charcoal transition hover:bg-kc-sand/30 disabled:opacity-40"
                              aria-label="Restar"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={qty || ""}
                              onChange={(e) => {
                                const v = parseInt(e.target.value) || 0;
                                setCoffeeBreakQtys((prev) => ({
                                  ...prev,
                                  [item.id]: Math.max(0, v),
                                }));
                              }}
                              placeholder="0"
                              className="w-16 rounded-lg border border-kc-sand px-2 py-1.5 text-center text-sm outline-none focus:border-kc-rose-gold"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCoffeeBreakQtys((prev) => ({
                                  ...prev,
                                  [item.id]: qty + 1,
                                }))
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-kc-sand text-kc-charcoal transition hover:bg-kc-sand/30"
                              aria-label="Sumar"
                            >
                              +
                            </button>
                          </div>
                          {lineTotal > 0 && (
                            <div className="w-full text-right text-xs text-kc-mocha sm:w-auto sm:pl-2">
                              = <span className="font-semibold text-kc-charcoal">S/ {lineTotal.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-kc-rose-gold py-6 text-base font-semibold text-white transition-all hover:bg-kc-gold hover:shadow-xl hover:shadow-kc-rose-gold/20"
            >
              {submitting ? "Enviando solicitud..." : "Enviar solicitud de cotización"}
            </Button>

            <p className="text-center text-xs text-kc-mocha">
              🔒 Tu información está segura y solo será utilizada para contactarte con la cotización.
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
