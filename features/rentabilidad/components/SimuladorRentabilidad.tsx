"use client";

import { useState, useId, useMemo } from "react";
import {
  Cake, Package, Users, Building2, Copy, RotateCcw,
  TrendingUp, AlertTriangle, CheckCircle2, Info, Target,
  ChevronDown, ChevronUp, Percent, DollarSign, Clock,
} from "lucide-react";
import { toast } from "sonner";

import type { ProductoPreset } from "../types/rentabilidad.types";
import type { DesgloseCosteo } from "../services/costeo-real.service";

type Props = {
  productosExistentes: ProductoPreset[];
  costeosIniciales: Record<string, DesgloseCosteo | null>;
};

export function SimuladorRentabilidad({ productosExistentes, costeosIniciales }: Props) {
  const [productoId, setProductoId] = useState("");
  const [margenObjetivo, setMargenObjetivo] = useState(70);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const idProducto = useId();
  const idMargen = useId();

  const costeo = useMemo(() => {
    return costeosIniciales[productoId] ?? null;
  }, [productoId, costeosIniciales]);

  const producto = useMemo(() => {
    return productosExistentes.find(p => p.id === productoId) ?? null;
  }, [productoId, productosExistentes]);

  const precioSugerido = useMemo(() => {
    if (!costeo || costeo.costoCompletoUnitario <= 0) return 0;
    const factor = 1 - margenObjetivo / 100;
    return factor > 0 ? costeo.costoCompletoUnitario / factor : 0;
  }, [costeo, margenObjetivo]);

  const precioMinimo = useMemo(() => {
    if (!costeo) return 0;
    return costeo.costoCompletoUnitario;
  }, [costeo]);

  function copiar() {
    if (!costeo || !producto) return;

    const texto = `📊 COSTEO REAL — ${producto.nombre}
═══════════════════════════════════

CAPA 1 · INGREDIENTES (receta FoodOS):
  Rinde: ${costeo.rendimiento} porciones
  Costo ingredientes: S/ ${costeo.costoIngredientes.toFixed(2)}/porción
${costeo.mermaAplicada.length > 0 ? `  Mermas: ${costeo.mermaAplicada.join(", ")}` : "  Sin mermas aplicadas"}

CAPA 2 · EMPAQUES Y DIRECTOS:
  Empaques: S/ ${costeo.costoEmpaques.toFixed(2)}
  Otros directos (comisión): S/ ${costeo.costoOtrosDirectos.toFixed(2)}

CAPA 3 · MANO DE OBRA DIRECTA:
  Minutos activos: ${costeo.minutosActivosTotales}
  Costo por minuto: S/ ${costeo.costoPorMinuto.toFixed(4)}
  Costo asignado: S/ ${costeo.costoManoObra.toFixed(2)}/porción

CAPA 4 · COSTOS INDIRECTOS:
  Fijos mensuales: S/ ${costeo.totalFijosMensuales.toFixed(0)}
  Capacidad: ${costeo.unidadesMensualesCapacidad} unidades/mes
  Asignado por unidad: S/ ${costeo.costoIndirectosAsignado.toFixed(2)}

═══════════════════════════════════
  COSTO VARIABLE: S/ ${costeo.costoVariableUnitario.toFixed(2)}
  COSTO COMPLETO: S/ ${costeo.costoCompletoUnitario.toFixed(2)}
  PRECIO ACTUAL: S/ ${Number(producto.precio_venta || 0).toFixed(2)}
  MARGEN CONTRIBUCIÓN: S/ ${costeo.margenContribucion.toFixed(2)} (${costeo.margenContribucionPct}%)
  MARGEN BRUTO: ${costeo.margenBrutoPct}%
═══════════════════════════════════
  PRECIO MÍNIMO SOSTENIBLE: S/ ${precioMinimo.toFixed(2)}
  PRECIO SUGERIDO (margen ${margenObjetivo}%): S/ ${precioSugerido.toFixed(2)}

  ORIGEN DATOS: ${costeo.origenDatos}
${costeo.datosFaltantes.length > 0 ? `\n  ⚠️ DATOS FALTANTES:\n  ${costeo.datosFaltantes.map(d => `- ${d}`).join("\n  ")}` : ""}
${costeo.alertas.length > 0 ? `\n  ALERTAS:\n  ${costeo.alertas.map(a => `- ${a}`).join("\n  ")}` : ""}`;

    navigator.clipboard.writeText(texto);
    toast.success("Costeo copiado al portapapeles.");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Costeo Real por Producto
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Cuatro capas conectadas a datos reales: ingredientes → empaques → mano de obra → indirectos.
          </p>
        </div>
        <button
          type="button"
          onClick={copiar}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Copy className="h-3.5 w-3.5" /> Copiar diagnóstico
        </button>
      </div>

      {/* Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor={idProducto} className="mb-2 block text-sm font-bold text-slate-800">
          <Cake className="mr-1.5 inline h-4 w-4 text-blue-600" />
          Producto a costear
        </label>
        <select
          id={idProducto}
          value={productoId}
          onChange={e => setProductoId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-800"
        >
          <option value="">Seleccionar de tus recetas FoodOS…</option>
          {productosExistentes.map(prod => (
            <option key={prod.id} value={prod.id}>
              {prod.nombre}
              {prod.precio_costo ? ` — ingredientes: S/ ${Number(prod.precio_costo).toFixed(2)}` : " — sin receta"}
              {prod.precio_venta ? ` · precio: S/ ${Number(prod.precio_venta).toFixed(2)}` : ""}
            </option>
          ))}
        </select>
      </div>

      {!productoId && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <Info className="mr-1.5 inline h-4 w-4" />
          Selecciona un producto para ver su costeo completo con desglose por capa.
        </div>
      )}

      {productoId && !costeo && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mr-1.5 inline h-4 w-4" />
          Este producto no tiene receta activa. Crea su receta primero en Productos & Recetas.
        </div>
      )}

      {costeo && producto && (
        <>
          {/* Resumen ejecutivo */}
          <div className={`rounded-2xl border-2 p-6 shadow-md ${
            costeo.margenBrutoPct > 40 ? "border-emerald-300 bg-emerald-50" :
            costeo.margenBrutoPct > 20 ? "border-amber-300 bg-amber-50" :
            "border-red-300 bg-red-50"
          }`}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Costo Variable</p>
                <p className="text-2xl font-black text-slate-800">
                  S/ {costeo.costoVariableUnitario.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Costo Completo</p>
                <p className="text-2xl font-black text-slate-800">
                  S/ {costeo.costoCompletoUnitario.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Precio Actual</p>
                <p className="text-2xl font-black text-slate-800">
                  S/ {Number(producto.precio_venta || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Margen Contribución</p>
                <p className="text-2xl font-black text-blue-700">
                  {costeo.margenContribucionPct}%
                </p>
              </div>
              <div className={`rounded-xl p-2 ${
                costeo.margenBrutoPct > 40 ? "bg-emerald-600" :
                costeo.margenBrutoPct > 20 ? "bg-amber-500" : "bg-red-600"
              }`}>
                <p className="text-[11px] font-bold uppercase text-white/80">Margen Bruto</p>
                <p className="text-3xl font-black text-white">
                  {costeo.margenBrutoPct}%
                </p>
              </div>
            </div>
          </div>

          {/* Alertas y datos faltantes */}
          {(costeo.alertas.length > 0 || costeo.datosFaltantes.length > 0) && (
            <div className="space-y-2">
              {costeo.alertas.map((alerta, i) => (
                <div key={`a${i}`} className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                  {alerta}
                </div>
              ))}
              {costeo.datosFaltantes.map((falta, i) => (
                <div key={`f${i}`} className="rounded-lg border-l-4 border-orange-400 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
                  <Info className="mr-1 inline h-4 w-4" />
                  {falta}
                </div>
              ))}
            </div>
          )}

          {/* Precio sugerido */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-slate-600" />
              <div>
                <p className="text-xs font-bold text-slate-500">MARGEN OBJETIVO</p>
                <div className="flex items-center gap-2">
                  <input
                    id={idMargen}
                    type="number"
                    min="10"
                    max="90"
                    value={margenObjetivo}
                    onChange={e => setMargenObjetivo(Number(e.target.value) || 70)}
                    className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm font-bold text-slate-700"
                  />
                  <span className="text-sm text-slate-500">% del precio</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs font-medium text-slate-500">Mínimo sostenible</p>
                <p className="text-lg font-bold text-slate-700">
                  S/ {precioMinimo.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Precio sugerido</p>
                <p className="text-xl font-black text-slate-900">
                  S/ {precioSugerido.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose por capas (plegable) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setMostrarDetalle(!mostrarDetalle)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <span className="text-sm font-bold text-slate-800">
                Desglose completo por capa
              </span>
              {mostrarDetalle ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {mostrarDetalle && (
              <div className="space-y-4 border-t px-5 py-4">
                {/* Capa 1: Ingredientes */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">1</span>
                    Ingredientes (S/ {costeo.costoIngredientes.toFixed(2)}/porción, rinde {costeo.rendimiento})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-left text-slate-500">
                        <tr className="border-b">
                          <th className="py-1.5">Ingrediente</th>
                          <th className="py-1.5 text-right">Cantidad</th>
                          <th className="py-1.5">Unidad</th>
                          <th className="py-1.5 text-right">Costo/und uso</th>
                          <th className="py-1.5 text-right">Merma</th>
                          <th className="py-1.5 text-right">Costo línea</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {costeo.ingredientesDetalle.map((ing, i) => (
                          <tr key={i}>
                            <td className="py-1.5 font-medium">{ing.nombre}</td>
                            <td className="py-1.5 text-right">{ing.cantidad}</td>
                            <td className="py-1.5 text-slate-500">{ing.unidad}</td>
                            <td className="py-1.5 text-right text-slate-600">
                              S/ {ing.costoUnitarioUso.toFixed(6)}
                            </td>
                            <td className="py-1.5 text-right text-amber-600">
                              {ing.mermaPct > 0 ? `${ing.mermaPct}%` : "—"}
                            </td>
                            <td className="py-1.5 text-right font-bold text-emerald-700">
                              S/ {ing.costoLinea.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {costeo.mermaAplicada.length > 0 && (
                    <p className="mt-1.5 text-[11px] text-amber-600">
                      Mermas: {costeo.mermaAplicada.join(" · ")}
                    </p>
                  )}
                </div>

                {/* Capa 2: Empaques */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">2</span>
                    Empaques y Directos (S/ {(costeo.costoEmpaques + costeo.costoOtrosDirectos).toFixed(2)})
                  </h4>
                  <div className="space-y-1 text-xs">
                    {costeo.empaques.map((e, i) => (
                      <div key={i} className="flex justify-between rounded bg-blue-50 px-3 py-1.5">
                        <span className="text-blue-700">{e.nombre} × {e.cantidad}</span>
                        <span className="font-bold text-blue-800">S/ {e.costoTotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between rounded bg-blue-50/50 px-3 py-1.5">
                      <span className="text-blue-700">Comisión pasarela (estimada)</span>
                      <span className="font-bold text-blue-800">S/ {costeo.costoOtrosDirectos.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Capa 3: Mano de obra */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">3</span>
                    Mano de Obra Directa (S/ {costeo.costoManoObra.toFixed(2)}/porción)
                  </h4>
                  <div className="space-y-1 text-xs">
                    {costeo.manoObra.length > 0 ? (
                      costeo.manoObra.map((m, i) => (
                        <div key={i} className="flex justify-between rounded bg-amber-50 px-3 py-1.5">
                          <span className="text-amber-700 capitalize">
                            {m.fase} · {m.minutosActivos} min activos
                            {m.minutosPasivos > 0 && ` (+${m.minutosPasivos} min pasivos, no cobrados)`}
                          </span>
                          <span className="font-bold text-amber-800">S/ {m.costoAsignado.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded bg-amber-50 px-3 py-1.5 text-amber-600">
                        Sin minutos registrados. Registra en Admin → Mano de Obra.
                      </p>
                    )}
                  </div>
                </div>

                {/* Capa 4: Indirectos */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">4</span>
                    Costos Indirectos (S/ {costeo.costoIndirectosAsignado.toFixed(2)}/unidad)
                  </h4>
                  <div className="space-y-1 text-xs">
                    {costeo.costosFijos.length > 0 ? (
                      costeo.costosFijos.map((c, i) => (
                        <div key={i} className="flex justify-between rounded bg-slate-100 px-3 py-1.5">
                          <span className="text-slate-700">{c.concepto}</span>
                          <span className="font-bold text-slate-800">S/ {c.montoMensual.toFixed(0)}/mes</span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded bg-slate-100 px-3 py-1.5 text-slate-500">
                        Sin costos fijos configurados en la base. Configura en Admin → Costos Fijos.
                      </p>
                    )}
                    <div className="mt-1.5 rounded bg-slate-800 px-3 py-2 text-white">
                      <span className="text-xs">Tasa: S/ {costeo.totalFijosMensuales.toFixed(0)} ÷ {costeo.unidadesMensualesCapacidad} unidades/mes = </span>
                      <span className="text-sm font-bold">S/ {costeo.costoIndirectosAsignado.toFixed(2)}/unidad</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
