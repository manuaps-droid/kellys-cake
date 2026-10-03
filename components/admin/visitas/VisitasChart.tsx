"use client";

import { useState } from "react";
import type { VisitaDia } from "@/features/admin/visitas/types/visitas.type";

interface Props {
  historial: VisitaDia[];
}

export default function VisitasChart({ historial }: Props) {
  const [diasMostrar, setDiasMostrar] = useState<14 | 30>(14);
  const [hoveredDia, setHoveredDia] = useState<VisitaDia | null>(null);

  // Invertir para que el orden cronológico sea de izquierda a derecha (más antiguo -> más reciente)
  const items = historial.slice(0, diasMostrar).reverse();

  const maxTotal = Math.max(...items.map((d) => d.total), 10);

  const formatFechaCorta = (fechaStr: string) => {
    try {
      const [, m, d] = fechaStr.split("-");
      const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Oct",
        "Nov",
        "Dic",
      ];
      return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1] || ""}`;
    } catch {
      return fechaStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-cake-espresso" />
            <span className="text-gray-600 font-medium">
              Vistas Totales
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-cake-gold" />
            <span className="text-gray-600 font-medium">
              Visitantes Únicos
            </span>
          </div>
        </div>

        <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setDiasMostrar(14)}
            className={`rounded-md px-2.5 py-1 transition-all ${
              diasMostrar === 14
                ? "bg-white text-cake-espresso shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            14 días
          </button>
          <button
            type="button"
            onClick={() => setDiasMostrar(30)}
            className={`rounded-md px-2.5 py-1 transition-all ${
              diasMostrar === 30
                ? "bg-white text-cake-espresso shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="relative pt-6">
        {/* Tooltip flotante si hay hovered */}
        {hoveredDia && (
          <div className="pointer-events-none mb-3 inline-flex items-center gap-3 rounded-lg border border-cake-gold/30 bg-[#FFFDF8] px-3.5 py-2 text-xs shadow-sm">
            <span className="font-semibold text-cake-espresso">
              📅 {hoveredDia.fecha}
            </span>
            <span className="text-gray-600">
              Vistas:{" "}
              <strong className="text-cake-espresso">
                {hoveredDia.total}
              </strong>
            </span>
            <span className="text-gray-600">
              Únicos:{" "}
              <strong className="text-cake-gold">
                {hoveredDia.unicos}
              </strong>
            </span>
            <span className="text-gray-500 text-[11px]">
              (Móvil: {hoveredDia.dispositivos?.movil || 0} / PC:{" "}
              {hoveredDia.dispositivos?.desktop || 0})
            </span>
          </div>
        )}

        <div className="flex h-56 items-end gap-1.5 sm:gap-2 border-b border-gray-200 pb-2">
          {items.map((dia) => {
            const pctTotal = Math.round((dia.total / maxTotal) * 100);
            const pctUnicos = Math.round((dia.unicos / maxTotal) * 100);

            return (
              <div
                key={dia.fecha}
                onMouseEnter={() => setHoveredDia(dia)}
                onMouseLeave={() => setHoveredDia(null)}
                className="group relative flex flex-1 flex-col items-center justify-end h-full"
              >
                <div className="flex w-full items-end justify-center gap-0.5 h-full">
                  {/* Barra Total */}
                  <div
                    style={{ height: `${Math.max(pctTotal, dia.total > 0 ? 6 : 2)}%` }}
                    className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${
                      dia.total > 0
                        ? "bg-cake-espresso group-hover:bg-cake-espresso/80"
                        : "bg-gray-200"
                    }`}
                  />
                  {/* Barra Únicos */}
                  <div
                    style={{ height: `${Math.max(pctUnicos, dia.unicos > 0 ? 6 : 2)}%` }}
                    className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${
                      dia.unicos > 0
                        ? "bg-cake-gold group-hover:bg-cake-gold/80"
                        : "bg-gray-100"
                    }`}
                  />
                </div>

                {/* Fecha abajo */}
                <span className="mt-2 block text-[10px] text-gray-500 font-medium truncate max-w-[34px] group-hover:text-cake-espresso">
                  {formatFechaCorta(dia.fecha)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
