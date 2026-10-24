"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3, ChevronDown, ChevronUp, Plus, Trash2, Save } from "lucide-react";
import {
  guardarCostoFijoAction,
  eliminarCostoFijoAction,
  guardarConfiguracionKpisAction,
} from "@/features/rentabilidad/actions/costeo-config.action";
import type { FilaMesKpi } from "@/features/kpis/services/kpis-financieros.service";

export type KpisFinancieros = {
  ros: number | null;
  roi: number | null;
  roe: number | null;
  peUnidades: number | null;
  peSoles: number | null;
  ventasMes: number;
  utilidadMes: number | null;
};

type Props = {
  kpis: KpisFinancieros;
  costosFijos: Array<{ id: string; concepto: string; monto: number }>;
  inversion: number;
  patrimonio: number;
  serieMensual: FilaMesKpi[];
};

type Fila = {
  id?: string;
  concepto: string;
  monto: number;
};

export default function KpisFinancierosCard({
  kpis,
  costosFijos,
  inversion,
  patrimonio,
  serieMensual,
}: Props) {
  const [expandido, setExpandido] = useState(false);
  const [filas, setFilas] = useState<Fila[]>(costosFijos);
  const [inv, setInv] = useState<string>(inversion > 0 ? String(inversion) : "");
  const [pat, setPat] = useState<string>(patrimonio > 0 ? String(patrimonio) : "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Resincroniza el estado cuando el servidor envía datos nuevos
  // (tras router.refresh). Evita filas sin ID que se duplicarían al
  // guardar de nuevo y garantiza que la tabla muestre datos reales.
  const [prevProps, setPrevProps] = useState({ costosFijos, inversion, patrimonio });
  if (
    costosFijos !== prevProps.costosFijos ||
    inversion !== prevProps.inversion ||
    patrimonio !== prevProps.patrimonio
  ) {
    setPrevProps({ costosFijos, inversion, patrimonio });
    setFilas(costosFijos);
    setInv(inversion > 0 ? String(inversion) : "");
    setPat(patrimonio > 0 ? String(patrimonio) : "");
  }

  const pct = (v: number | null) =>
    v == null ? "—" : `${(Math.round(v * 10) / 10).toLocaleString("es-PE")}%`;

  const soles = (v: number | null, dec = 0) =>
    v == null
      ? "—"
      : `S/ ${v.toLocaleString("es-PE", { maximumFractionDigits: dec })}`;

  const colorValor = (v: number | null) =>
    v == null ? "text-kc-mocha/50" : v >= 0 ? "text-emerald-600" : "text-red-600";

  const arribaPE =
    kpis.peSoles != null && kpis.ventasMes >= kpis.peSoles && kpis.peSoles > 0;

  const maxBarra = Math.max(
    ...serieMensual.map((m) => m.ventas),
    kpis.peSoles ?? 0,
    1
  );

  const agregarFila = () =>
    setFilas((prev) => [...prev, { concepto: "", monto: 0 }]);

  const eliminarFila = (idx: number) =>
    startTransition(async () => {
      const fila = filas[idx];
      if (fila.id) {
        const r = await eliminarCostoFijoAction(fila.id);
        if (r.error) {
          toast.error(r.error);
          return;
        }
        toast.success("Costo fijo eliminado");
      }
      setFilas((prev) => prev.filter((_, i) => i !== idx));
      router.refresh();
    });

  const guardar = () =>
    startTransition(async () => {
      let errores = 0;

      for (const f of filas) {
        const concepto = f.concepto.trim();
        if (concepto.length < 2) continue;
        const r = await guardarCostoFijoAction({
          id: f.id,
          concepto,
          monto_mensual: f.monto,
        });
        if (r.error) errores += 1;
      }

      const rk = await guardarConfiguracionKpisAction({
        inversion_total: Number(inv) || 0,
        patrimonio: Number(pat) || 0,
      });
      if (rk.error) errores += 1;

      if (errores === 0) {
        toast.success("KPIs y costos fijos actualizados");
      } else {
        toast.error("Algunos cambios no se pudieron guardar");
      }
      // Siempre refrescar: el servidor recalcula el punto de equilibrio
      router.refresh();
    });

  return (
    <div className="bg-white rounded-2xl shadow-xs border-2 border-kc-blush/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full p-6 text-left transition hover:bg-kc-sand/40"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-kc-rose-gold" />
            KPIs Financieros
          </h3>
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-kc-mocha/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-kc-mocha/70" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-kc-mocha/70">ROS</p>
            <p className={`text-lg font-bold leading-none ${colorValor(kpis.ros)}`}>
              {pct(kpis.ros)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-kc-mocha/70">
              ROI anual
            </p>
            <p className={`text-lg font-bold leading-none ${colorValor(kpis.roi)}`}>
              {pct(kpis.roi)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-kc-mocha/70">
              ROE anual
            </p>
            <p className={`text-lg font-bold leading-none ${colorValor(kpis.roe)}`}>
              {pct(kpis.roe)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-kc-mocha/70">
              Punto equilibrio
            </p>
            <p className="text-lg font-bold leading-none text-kc-charcoal">
              {kpis.peSoles == null ? "—" : soles(kpis.peSoles)}
            </p>
          </div>
        </div>

        <span className="text-[10px] text-kc-mocha/70 mt-2 block">
          Editar costos fijos e inversión
        </span>
      </button>

      {expandido && (
        <div className="border-t border-kc-blush/30 px-5 pb-5 space-y-4">
          {/* Resumen del mes */}
          <div className="pt-3 rounded-xl bg-kc-sand/60 p-3 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-kc-mocha">Ventas del mes</span>
              <span className="font-bold text-kc-charcoal">{soles(kpis.ventasMes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-kc-mocha">Utilidad estimada del mes</span>
              <span className={`font-bold ${colorValor(kpis.utilidadMes)}`}>
                {soles(kpis.utilidadMes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-kc-mocha">Punto de equilibrio</span>
              <span className="font-bold text-kc-charcoal">
                {kpis.peSoles == null
                  ? "—"
                  : `${soles(kpis.peSoles)} / mes`}
                {kpis.peUnidades != null && (
                  <span className="text-kc-mocha/70"> ({Math.ceil(kpis.peUnidades)} und)</span>
                )}
              </span>
            </div>
            {kpis.peSoles != null && kpis.peSoles > 0 && (
              <p
                className={`pt-1 font-bold ${
                  arribaPE ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {arribaPE
                  ? "✅ Estás por encima del punto de equilibrio"
                  : "⚠️ Aún no alcanzas el punto de equilibrio"}
              </p>
            )}
          </div>

          {/* Ventas por mes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-kc-mocha mb-2">
              Ventas por mes · últimos 6 meses
            </p>
            <div className="rounded-xl bg-kc-sand/60 p-3">
              <div className="relative h-28">
                {kpis.peSoles != null && kpis.peSoles > 0 && (
                  <>
                    <div
                      className="absolute inset-x-0 border-t border-dashed border-kc-rose-gold"
                      style={{ bottom: `${(kpis.peSoles / maxBarra) * 100}%` }}
                    />
                    <span
                      className="absolute right-0 -translate-y-[130%] rounded bg-kc-rose-gold px-1 text-[8px] font-bold text-kc-deep"
                      style={{ bottom: `${(kpis.peSoles / maxBarra) * 100}%` }}
                    >
                      PE S/ {Math.round(kpis.peSoles)}
                    </span>
                  </>
                )}
                <div className="flex h-full items-end justify-between gap-2">
                  {serieMensual.map((m) => (
                    <div
                      key={m.mes}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className={`w-full max-w-10 rounded-t-md transition-all ${
                          kpis.peSoles != null && kpis.peSoles > 0
                            ? m.ventas >= kpis.peSoles
                              ? "bg-emerald-500"
                              : m.ventas > 0
                                ? "bg-amber-400"
                                : "bg-kc-sand"
                            : m.ventas > 0
                              ? "bg-kc-rose-gold"
                              : "bg-kc-sand"
                        }`}
                        style={{
                          height: `${Math.max(m.ventas > 0 ? 4 : 2, (m.ventas / maxBarra) * 100)}%`,
                        }}
                        title={`${m.mes}: S/ ${m.ventas}${
                          m.utilidad != null ? ` · Utilidad est. S/ ${m.utilidad}` : ""
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-1.5 flex justify-between gap-2">
                {serieMensual.map((m) => (
                  <span
                    key={m.mes}
                    className="flex-1 text-center text-[9px] font-bold text-kc-mocha"
                  >
                    {m.etiqueta}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[9px] font-semibold text-kc-mocha">
                {kpis.peSoles != null && kpis.peSoles > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> sobre PE
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400" /> bajo PE
                    </span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <span className="w-3 border-t border-dashed border-kc-rose-gold" /> punto de equilibrio
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de costos fijos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-kc-mocha mb-2">
              Costos fijos mensuales
            </p>
            <div className="space-y-1.5">
              {filas.map((f, idx) => (
                <div key={f.id ?? `nueva-${idx}`} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={f.concepto}
                    placeholder="Ej: Alquiler, Luz, Planilla"
                    onChange={(e) =>
                      setFilas((prev) =>
                        prev.map((r, i) =>
                          i === idx ? { ...r, concepto: e.target.value } : r
                        )
                      )
                    }
                    className="flex-1 min-w-0 rounded-lg border border-kc-blush/60 bg-white px-2.5 py-1.5 text-[11px] text-kc-charcoal placeholder:text-kc-mocha/40 focus:outline-none focus:ring-1 focus:ring-kc-rose-gold"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={f.monto || ""}
                    placeholder="0.00"
                    onChange={(e) =>
                      setFilas((prev) =>
                        prev.map((r, i) =>
                          i === idx
                            ? { ...r, monto: Math.max(0, Number(e.target.value) || 0) }
                            : r
                        )
                      )
                    }
                    className="w-20 rounded-lg border border-kc-blush/60 bg-white px-2 py-1.5 text-[11px] font-semibold text-kc-charcoal focus:outline-none focus:ring-1 focus:ring-kc-rose-gold"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarFila(idx)}
                    disabled={pending}
                    className="shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                    aria-label="Eliminar costo fijo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregarFila}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-dashed border-kc-rose-gold/60 px-2.5 py-1.5 text-[11px] font-bold text-kc-rose-gold hover:bg-kc-sand/50 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar costo fijo
            </button>
          </div>

          {/* Inversión y patrimonio */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-kc-mocha">
                Inversión total (ROI)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={inv}
                placeholder="S/ 0.00"
                onChange={(e) => setInv(e.target.value)}
                className="mt-1 w-full rounded-lg border border-kc-blush/60 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-kc-charcoal placeholder:text-kc-mocha/40 focus:outline-none focus:ring-1 focus:ring-kc-rose-gold"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-kc-mocha">
                Patrimonio (ROE)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pat}
                placeholder="S/ 0.00"
                onChange={(e) => setPat(e.target.value)}
                className="mt-1 w-full rounded-lg border border-kc-blush/60 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-kc-charcoal placeholder:text-kc-mocha/40 focus:outline-none focus:ring-1 focus:ring-kc-rose-gold"
              />
            </label>
          </div>

          {/* Guardar */}
          <button
            type="button"
            onClick={guardar}
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-kc-charcoal hover:bg-kc-deep text-kc-cream font-bold py-2.5 text-xs transition border border-kc-gold/30 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>

          <p className="text-[10px] text-kc-mocha/70 leading-relaxed">
            Punto de equilibrio = costos fijos ÷ margen de contribución promedio.
            ROI y ROE anualizados con la utilidad estimada del mes (ventas ×
            margen de contribución − costos fijos). Llena inversión y patrimonio
            para activarlos.
          </p>
        </div>
      )}
    </div>
  );
}
