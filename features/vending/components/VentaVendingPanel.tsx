"use client";

import { useState } from "react";

type MaquinaVendingUI = {
  id: string;
  nombre: string;
  ubicacion: string;
  formato: string;
  capacidad_slots: number;
  productos_vendidos: number;
  ingresos_totales: number;
  costo_total: number;
  utilidad_bruta: number;
  margen_porcentaje: number;
  estado: "saludable" | "alerta" | "critico";
};

type ProductoVendingUI = {
  id: string;
  nombre: string;
  precio_venta: number;
  costo_unitario: number;
  cantidad_actual: number;
};

type VentaVendingUI = {
  id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_venta: string;
};

type Props = {
  maquinas: MaquinaVendingUI[];
  inventario: ProductoVendingUI[];
  ventas: VentaVendingUI[];
  onCrearMaquina: (data: {
    nombre: string;
    ubicacion: string;
    tipo_ubicacion: string;
    formato: string;
    capacidad_slots: number;
  }) => Promise<void>;
  onRegistrarVenta: (data: {
    maquina_id: string;
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
  }) => Promise<void>;
  calculando: boolean;
};

export default function VentaVendingPanel({
  maquinas,
  onCrearMaquina,
  calculando,
}: Props) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState("");
  const [nuevaCapacidad, setNuevaCapacidad] = useState("10");
  const [guardando, setGuardando] = useState(false);

  const agregarMaquina = async () => {
    if (!nuevoNombre.trim() || !nuevaUbicacion.trim()) return;
    setGuardando(true);
    try {
      await onCrearMaquina({
        nombre: nuevoNombre.trim(),
        ubicacion: nuevaUbicacion.trim(),
        tipo_ubicacion: "otro",
        formato: "pantalla_tactil",
        capacidad_slots: Number(nuevaCapacidad) || 10,
      });
      setNuevoNombre("");
      setNuevaUbicacion("");
      setNuevaCapacidad("10");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Registrar nueva máquina */}
      <div className="rounded-2xl border border-kc-blush/40 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-kc-mocha">
          Registrar nueva máquina expendedora
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
              Nombre
            </label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Vending Clínica San Pablo"
              className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
              Ubicación
            </label>
            <input
              type="text"
              value={nuevaUbicacion}
              onChange={(e) => setNuevaUbicacion(e.target.value)}
              placeholder="Ej: Av. Ejército 810, Cayma"
              className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-kc-mocha">
              Capacidad (slots)
            </label>
            <input
              type="number"
              min={0}
              value={nuevaCapacidad}
              onChange={(e) => setNuevaCapacidad(e.target.value)}
              className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={agregarMaquina}
          disabled={guardando || !nuevoNombre.trim() || !nuevaUbicacion.trim()}
          className="mt-4 rounded-xl border border-kc-gold/30 bg-kc-charcoal px-5 py-2.5 text-sm font-bold text-kc-cream shadow-md transition hover:bg-kc-deep disabled:opacity-50"
        >
          🤖 {guardando ? "Guardando..." : "Registrar máquina"}
        </button>
      </div>

      {/* Listado de máquinas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {maquinas.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-kc-blush/40 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-kc-charcoal">{m.nombre}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  m.formato === "pantalla_tactil"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {m.formato === "pantalla_tactil" ? "Pantalla" : "Vidrio"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-kc-mocha">{m.ubicacion}</p>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-kc-sand/60 p-2">
                <p className="text-[9px] font-bold uppercase text-kc-mocha">
                  Vendidos
                </p>
                <p className="text-lg font-black text-kc-charcoal">
                  {m.productos_vendidos}
                </p>
              </div>
              <div className="rounded-lg bg-kc-sand/60 p-2">
                <p className="text-[9px] font-bold uppercase text-kc-mocha">
                  Ingresos
                </p>
                <p className="text-sm font-black text-kc-charcoal">
                  S/ {m.ingresos_totales.toFixed(0)}
                </p>
              </div>
              <div className="rounded-lg bg-kc-sand/60 p-2">
                <p className="text-[9px] font-bold uppercase text-kc-mocha">
                  Margen
                </p>
                <p
                  className={`text-sm font-black ${
                    m.margen_porcentaje > 40
                      ? "text-emerald-600"
                      : m.margen_porcentaje > 20
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {m.margen_porcentaje.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        ))}

        {maquinas.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-kc-blush/60 bg-white p-6 text-center text-sm text-kc-mocha">
            No hay máquinas registradas todavía. Registra la primera con el
            formulario de arriba.
          </div>
        )}
      </div>

      {calculando && (
        <div className="rounded-2xl border border-kc-blush/40 bg-white p-4 text-center text-sm text-kc-mocha">
          Procesando...
        </div>
      )}
    </div>
  );
}
