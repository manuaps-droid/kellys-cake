"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import AddToCartButton from "@/features/cart/components/AddToCartButton";

type Tier = {
  cantidad_minima: number;
  precio: number;
};

type Presentacion = {
  id: string;
  nombre: string;
  precio: number;
};

type Opcion = {
  key: string;
  presentacionId: string | null;
  label: string;
  precio: number;
};

type Props = {
  productoId: string;
  tiers?: Tier[];
  presentaciones?: Presentacion[];
};

export default function PrecioCantidadDropdown({
  productoId,
  tiers,
  presentaciones,
}: Props) {
  const [open, setOpen] = useState(false);
  const [seleccionada, setSeleccionada] = useState(0);

  const opciones = useMemo<Opcion[]>(() => {
    const lista: Opcion[] =
      presentaciones && presentaciones.length > 0
        ? presentaciones.map((p) => ({
            key: `pres-${p.id}`,
            presentacionId: p.id,
            label: p.nombre,
            precio: p.precio,
          }))
        : (tiers ?? []).map((t) => ({
            key: `tier-${t.cantidad_minima}`,
            presentacionId: null,
            label: `${t.cantidad_minima} und`,
            precio: t.precio,
          }));

    return lista.sort((a, b) => a.precio - b.precio);
  }, [tiers, presentaciones]);

  if (opciones.length === 0) return null;

  const actual = opciones[Math.min(seleccionada, opciones.length - 1)];
  const esLaMasEconomica = seleccionada === 0;

  return (
    <div>
      {/* Precio de la opción elegida (por defecto la más económica) */}
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-kc-mocha uppercase">
          {esLaMasEconomica ? "Desde" : "Precio"}
        </span>
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-kc-charcoal">
          S/ {actual.precio.toFixed(2)}
        </span>
      </div>

      {/* Selector de presentación */}
      {opciones.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`mt-1 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 ${
            open
              ? "border-kc-rose-gold bg-kc-cream shadow-sm"
              : "border-kc-sand/70 bg-white hover:border-kc-rose-gold/50 hover:bg-kc-cream/50"
          }`}
        >
          <span className="min-w-0 truncate text-kc-charcoal">
            <span className="text-kc-mocha">Elige: </span>
            <span className="font-semibold">{actual.label}</span>
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 flex-shrink-0 text-kc-mocha transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Lista de opciones */}
      {open && (
        <ul className="mt-2 space-y-1 rounded-xl border border-kc-sand bg-kc-cream/40 p-2">
          {opciones.map((opcion, idx) => (
            <li key={opcion.key}>
              <button
                type="button"
                onClick={() => {
                  setSeleccionada(idx);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white ${
                  idx === seleccionada ? "bg-white shadow-sm" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {idx === seleccionada && (
                    <Check className="h-3 w-3 flex-shrink-0 text-kc-rose-gold" />
                  )}
                  <span className="truncate text-kc-charcoal">
                    {opcion.label}
                  </span>
                </span>
                <span className="flex-shrink-0 font-semibold text-kc-rose-gold">
                  S/ {opcion.precio.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Agregar al carrito con la presentación elegida */}
      {actual.presentacionId && (
        <AddToCartButton
          productoId={productoId}
          presentacionId={actual.presentacionId}
          className="mt-3 w-full rounded-full py-2.5 text-xs font-semibold shadow-sm transition-all duration-300 hover:shadow-md"
        />
      )}
    </div>
  );
}
