"use client";

import Image from "next/image";
import { memo, useCallback, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Minus, Plus, RotateCcw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { addBoxToCartAction } from "@/features/cart/actions/add-box-to-cart.action";
import { useCart } from "@/features/cart/hooks/useCart";
import { TAMANOS_CAJA } from "@/lib/box/caja.config";

export type PresentacionSabor = {
  unidades: number;
  precio: number;
};

export type Relleno = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  presentaciones: PresentacionSabor[];
};

export type GrupoRelleno = {
  catalogoId: string;
  catalogoNombre: string;
  rellenos: Relleno[];
};

type Props = {
  productoId: string;
  grupos: GrupoRelleno[];
};

// Los sabores se agregan en paquetes de 6 (mínimo por sabor/producto)
const PAQUETE = 6;

// Precio de un sabor para `q` unidades según sus presentaciones:
// coincidencia exacta, o prorrateo con la presentación de referencia.
function precioSabor(r: Relleno, q: number): number {
  if (r.presentaciones.length === 0) return 0;
  const exacta = r.presentaciones.find((p) => p.unidades === q);
  if (exacta) return exacta.precio;
  const mayor = r.presentaciones
    .filter((p) => p.unidades > q)
    .sort((a, b) => a.unidades - b.unidades)[0];
  const ref = mayor ?? r.presentaciones[0];
  return (ref.precio / ref.unidades) * q;
}

// Tarjeta individual de un sabor. Memoizada para que un click en una
// tarjeta sólo re-renderice esa tarjeta (y no toda la lista).
type SaborCardProps = {
  relleno: Relleno;
  cantidad: number;
  plusDisabled: boolean;
  onCambiar: (id: string, delta: number) => void;
};

const SaborCard = memo(function SaborCard({
  relleno: r,
  cantidad,
  plusDisabled,
  onCambiar,
}: SaborCardProps) {
  const precio = precioSabor(r, cantidad);
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        cantidad > 0
          ? "border-kc-rose-gold/50 shadow-md"
          : "border-kc-sand/50 shadow-sm"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {r.imagen_url ? (
          <Image
            src={r.imagen_url}
            alt={r.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            🍬
          </div>
        )}
        {cantidad > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-kc-rose-gold px-2.5 py-0.5 text-xs font-bold text-white shadow">
            {cantidad} und
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 p-3">
        <p className="min-w-0 text-sm font-medium leading-snug text-kc-charcoal">
          {r.nombre}
        </p>
        <div className="mt-0.5 flex flex-shrink-0 items-center gap-2 rounded-full border border-kc-sand bg-kc-cream/40 px-1.5 py-1">
          <button
            type="button"
            aria-label={`Quitar un paquete de ${r.nombre}`}
            onClick={() => onCambiar(r.id, -1)}
            disabled={cantidad === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full text-kc-charcoal transition hover:bg-white disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-kc-charcoal">
            {cantidad}
          </span>
          <button
            type="button"
            aria-label={`Agregar un paquete de ${r.nombre}`}
            onClick={() => onCambiar(r.id, +1)}
            disabled={plusDisabled}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-kc-rose-gold text-white transition hover:opacity-90 disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-kc-sand/40 px-3 py-2">
        <span className="text-xs text-kc-mocha/80">
          {cantidad > 0 && plusDisabled ? "Caja casi lista" : "Paquete de 6 und"}
        </span>
        <span
          className={`text-xs font-semibold ${
            cantidad > 0 ? "text-kc-rose-gold" : "text-kc-mocha/60"
          }`}
        >
          {cantidad > 0
            ? `S/ ${precio.toFixed(2)}`
            : r.presentaciones.length > 0
              ? `desde S/ ${r.presentaciones[0].precio.toFixed(2)}`
              : "—"}
        </span>
      </div>
    </article>
  );
});

function Paso({
  numero,
  children,
}: {
  numero: number;
  children: ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold text-kc-charcoal">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kc-charcoal font-[family-name:var(--font-playfair)] text-sm text-kc-cream">
        {numero}
      </span>
      {children}
    </h2>
  );
}

export default function BoxBuilder({ productoId, grupos }: Props) {
  const [tamanoSel, setTamanoSel] = useState<number | null>(18);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const { refreshCart, openDrawer } = useCart();

  const objetivo = tamanoSel ?? 0;
  const totalUnidades = useMemo(
    () => Object.values(cantidades).reduce((a, b) => a + b, 0),
    [cantidades]
  );

  const completo = tamanoSel !== null && totalUnidades === objetivo;
  const restante = Math.max(objetivo - totalUnidades, 0);

  const composicion = useMemo(
    () =>
      grupos
        .flatMap((g) => g.rellenos)
        .filter((r) => (cantidades[r.id] ?? 0) > 0)
        .map((r) => ({
          productoId: r.id,
          nombre: r.nombre,
          cantidad: cantidades[r.id],
          precio: precioSabor(r, cantidades[r.id]),
        })),
    [grupos, cantidades]
  );

  const precioTotal = useMemo(
    () => composicion.reduce((a, c) => a + c.precio, 0),
    [composicion]
  );

  function elegirTamano(unidades: number) {
    setTamanoSel(unidades);
    setCantidades({});
  }

  // Agregar/quitar un paquete de 6 unidades a un sabor
  const cambiar = useCallback((id: string, delta: number) => {
    setCantidades((prev) => {
      const actual = prev[id] ?? 0;
      const otras = Object.entries(prev)
        .filter(([k]) => k !== id)
        .reduce((a, [, v]) => a + v, 0);
      const maximo = objetivo - otras;
      const siguiente = actual + delta * PAQUETE;
      return { ...prev, [id]: Math.min(Math.max(siguiente, 0), maximo) };
    });
  }, [objetivo]);

  const cambiarSabor = useCallback(
    (id: string, delta: number) => cambiar(id, delta),
    [cambiar]
  );

  function limpiar() {
    setCantidades({});
  }

  function agregar() {
    if (tamanoSel === null || !completo) return;

    const descripcion = composicion
      .map((c) => `${c.cantidad}× ${c.nombre}`)
      .join(", ");

    startTransition(async () => {
      const result = await addBoxToCartAction({
        productoId,
        nombre: `Caja de bocaditos · ${tamanoSel} und`,
        descripcion,
        composicion: composicion.map((c) => ({
          productoId: c.productoId,
          cantidad: c.cantidad,
        })),
      });

      if (!result.success) {
        toast.error(result.message ?? "No se pudo agregar la caja.");
        return;
      }

      await refreshCart();
      openDrawer();
      toast.success("¡Tu caja fue agregada al carrito!");
    });
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_340px]">
      {/* Columna principal */}
      <div className="space-y-12">
        {/* PASO 1: tamaño */}
        <section>
          <Paso numero={1}>Elige el tamaño de tu caja</Paso>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {TAMANOS_CAJA.map((u) => {
              const activo = tamanoSel === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => elegirTamano(u)}
                  className={`rounded-full border px-7 py-2.5 text-sm font-semibold transition-all ${
                    activo
                      ? "border-kc-rose-gold bg-kc-rose-gold text-white shadow-md"
                      : "border-kc-sand/60 bg-white text-kc-charcoal hover:border-kc-rose-gold/50"
                  }`}
                >
                  {u} unidades
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-kc-mocha">
            Agrega tus sabores en paquetes de{" "}
            <strong className="text-kc-charcoal">6 unidades</strong> (mínimo
            por sabor). Combina alfajores, macarrones y donas como prefieras.
            El precio de cada sabor sale de su presentación.
          </p>
        </section>

        {/* PASO 2: sabores */}
        <section className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Paso numero={2}>Arma tu caja</Paso>
            {totalUnidades > 0 && (
              <button
                type="button"
                onClick={limpiar}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-kc-mocha transition-colors hover:text-kc-rose-gold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Empezar de nuevo
              </button>
            )}
          </div>

          {grupos.map((g) => (
            <div key={g.catalogoId}>
              <div className="flex items-center gap-3">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-kc-charcoal">
                  {g.catalogoNombre}
                </h3>
                <span className="rounded-full bg-kc-blush/30 px-2.5 py-0.5 text-xs font-semibold text-kc-mocha">
                  {g.rellenos.length}{" "}
                  {g.rellenos.length === 1 ? "sabor" : "sabores"}
                </span>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {g.rellenos.map((r) => (
                  <SaborCard
                    key={r.id}
                    relleno={r}
                    cantidad={cantidades[r.id] ?? 0}
                    plusDisabled={restante < PAQUETE}
                    onCambiar={cambiarSabor}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Resumen (sticky en desktop) */}
      <aside className="lg:sticky lg:top-32">
        <div className="rounded-3xl border border-kc-sand/60 bg-white p-6 shadow-[0_15px_45px_-20px_rgba(44,24,16,0.25)]">
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-kc-charcoal">
            Tu caja
          </h3>
          <p className="mt-1 text-sm font-medium text-kc-rose-gold">
            Caja de bocaditos · {objetivo} und
          </p>

          {/* Progreso */}
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-kc-mocha">
                {tamanoSel !== null ? "Progreso" : "Sin tamaño elegido"}
              </span>
              <span
                className={`font-bold ${
                  completo ? "text-emerald-600" : "text-kc-charcoal"
                }`}
              >
                {totalUnidades}/{objetivo}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-kc-cream">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completo ? "bg-emerald-500" : "bg-kc-rose-gold"
                }`}
                style={{
                  width: `${objetivo ? Math.min((totalUnidades / objetivo) * 100, 100) : 0}%`,
                }}
              />
            </div>
            {!completo ? (
              <p className="mt-2 text-xs text-kc-mocha">
                Te faltan{" "}
                <strong className="text-kc-rose-gold">{restante}</strong>{" "}
                unidades por colocar.
              </p>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                ¡Tu caja está completa! 🎉
              </p>
            )}
          </div>

          {/* Composición */}
          <div className="mt-5 border-t border-kc-sand/50 pt-4">
            {composicion.length === 0 ? (
              <p className="text-sm text-kc-mocha/70 italic">
                Aún no has agregado sabores.
              </p>
            ) : (
              <ul className="space-y-2">
                {composicion.map((c) => (
                  <li
                    key={c.productoId}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 truncate text-kc-charcoal">
                      {c.nombre}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-1.5">
                      <span className="rounded-full bg-kc-blush/30 px-2 py-0.5 text-xs font-semibold text-kc-mocha">
                        ×{c.cantidad}
                      </span>
                      <span className="text-xs font-semibold text-kc-rose-gold">
                        S/ {c.precio.toFixed(2)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Precio + CTA */}
          <div className="mt-5 border-t border-kc-sand/50 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-kc-mocha uppercase">
                Total
              </span>
              <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
                S/ {precioTotal.toFixed(2)}
              </span>
            </div>

            <Button
              type="button"
              onClick={agregar}
              disabled={!completo || pending}
              className="mt-4 w-full rounded-full py-3 text-sm shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <ShoppingBag className="mr-2 inline h-4 w-4" />
              {pending
                ? "Agregando..."
                : completo
                  ? "Agregar al carrito"
                  : "Completa tu caja"}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}