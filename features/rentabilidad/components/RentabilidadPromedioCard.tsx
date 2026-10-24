"use client";

import { useState } from "react";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  margenPromedio: number;
  totalConReceta: number;
  saludables: number;
  alerta: number;
  criticos: number;
  productos: Array<{
    nombre: string;
    margen: number;
    costoCompleto: number;
    precio: number;
  }>;
};

export default function RentabilidadPromedioCard({
  margenPromedio,
  totalConReceta,
  saludables,
  alerta,
  criticos,
  productos,
}: Props) {
  const [expandido, setExpandido] = useState(false);

  const color =
    margenPromedio > 40
      ? "text-emerald-600"
      : margenPromedio > 20
        ? "text-amber-600"
        : "text-red-600";

  const borde =
    margenPromedio > 40
      ? "border-emerald-200"
      : margenPromedio > 20
        ? "border-amber-200"
        : "border-red-200";

  return (
    <div
      className={`bg-white rounded-2xl shadow-xs border-2 ${borde} overflow-hidden md:col-span-1`}
    >
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full p-6 text-left transition hover:bg-kc-sand/50"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-kc-rose-gold" />
            Rentabilidad Promedio
          </h3>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-kc-mocha/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-kc-mocha/70" />
          )}
        </div>
        <p className={`text-3xl font-black mt-2 ${color}`}>
          {Math.round(margenPromedio * 10) / 10}%
        </p>
        <span className="text-xs text-gray-400 mt-1 block">
          Margen bruto promedio · {totalConReceta} con receta
        </span>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 px-5 pb-5 space-y-3">
          {/* Semáforo */}
          <div className="flex flex-wrap justify-center gap-2 pt-3 text-[10px] font-bold">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
              ✅ {saludables} saludables
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
              ⚠️ {alerta} alerta
            </span>
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
              🚨 {criticos} críticos
            </span>
          </div>

          {/* Productos ordenados por margen (mayor a menor) */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {[...productos]
              .sort((a, b) => b.margen - a.margen)
              .map((p) => (
                <div
                  key={p.nombre}
                  className="flex items-center justify-between rounded-lg bg-kc-sand/60 px-3 py-1.5 text-[11px]"
                >
                  <span className="font-medium text-gray-700 truncate max-w-[50%]">
                    {p.nombre}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold shrink-0 ${
                      p.margen > 40
                        ? "bg-emerald-100 text-emerald-700"
                        : p.margen > 20
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {Math.round(p.margen * 10) / 10}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
