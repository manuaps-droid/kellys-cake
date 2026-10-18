"use client";

import { useState, useId, useEffect, useMemo } from "react";
import {
  Cake, Scale, Package, Percent, Copy, RotateCcw,
  TrendingUp, AlertTriangle, CheckCircle2, Info,
  DollarSign, Target, Lightbulb, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import type { ProductoPreset } from "../types/rentabilidad.types";
import {
  calcularCosteoDirecto,
  type ResultadoCosteoDirecto,
  EMPAQUE_DEFAULT,
  OTROS_DIRECTOS_DEFAULT,
  MULTIPLICADOR_DEFAULT,
} from "../utils/costeo-directo";
import { CATEGORIAS_MARGEN_SUGERIDO } from "../utils/calculadora-rentabilidad";

const STORAGE_KEY = "kellys_foodos_costeo_directo_v1";

type Props = {
  productosExistentes?: ProductoPreset[];
};

export function SimuladorRentabilidad({ productosExistentes = [] }: Props) {
  const idProducto = useId();
  const idEmpaque = useId();
  const idOtrosDirectos = useId();
  const idMultiplicador = useId();
  const idPrecioVenta = useId();

  const [productoId, setProductoId] = useState<string>("");
  const [productoNombre, setProductoNombre] = useState<string>("");
  const [costoIngredientes, setCostoIngredientes] = useState<number>(0);
  const [rendimiento, setRendimiento] = useState<number>(1);
  const [precioVenta, setPrecioVenta] = useState<number>(0);

  const [empaque, setEmpaque] = useState<number>(EMPAQUE_DEFAULT);
  const [otrosDirectos, setOtrosDirectos] = useState<number>(OTROS_DIRECTOS_DEFAULT);
  const [multiplicador, setMultiplicador] = useState<number>(MULTIPLICADOR_DEFAULT);

  const [categoriaId, setCategoriaId] = useState<string>("tortas-autor");
  const [margenObjetivo, setMargenObjetivo] = useState<number>(75);
  const [usarMargenPersonalizado, setUsarMargenPersonalizado] = useState(false);

  const [mostrarPuntoEquilibrio, setMostrarPuntoEquilibrio] = useState(false);
  const [costosFijosMensuales, setCostosFijosMensuales] = useState<number>(4400);
  const [unidadesMensualesEstimadas, setUnidadesMensualesEstimadas] = useState<number>(45);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.empaque != null) setEmpaque(parsed.empaque);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.otrosDirectos != null) setOtrosDirectos(parsed.otrosDirectos);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.multiplicador != null) setMultiplicador(parsed.multiplicador);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.categoriaId) setCategoriaId(parsed.categoriaId);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.margenObjetivo != null) setMargenObjetivo(parsed.margenObjetivo);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.usarMargenPersonalizado != null) setUsarMargenPersonalizado(parsed.usarMargenPersonalizado);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.costosFijosMensuales != null) setCostosFijosMensuales(parsed.costosFijosMensuales);
      }
    } catch { /* localStorage error */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        empaque, otrosDirectos, multiplicador, categoriaId,
        margenObjetivo, usarMargenPersonalizado, costosFijosMensuales,
      }));
    } catch { /* localStorage error */ }
  }, [empaque, otrosDirectos, multiplicador, categoriaId, margenObjetivo, usarMargenPersonalizado, costosFijosMensuales]);

  function handleSelectProducto(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (!id) return;
    const prod = productosExistentes.find(p => p.id === id);
    if (!prod) return;

    setProductoId(id);
    setProductoNombre(prod.nombre);
    const costo = Number(prod.precio_costo) || 0;
    setCostoIngredientes(costo);
    setPrecioVenta(Number(prod.precio_venta) || 0);
  }

  const categoriaActiva = useMemo(() => {
    return CATEGORIAS_MARGEN_SUGERIDO.find(c => c.id === categoriaId) ?? CATEGORIAS_MARGEN_SUGERIDO[0];
  }, [categoriaId]);

  const margenActivo = useMemo(() => {
    if (usarMargenPersonalizado) return margenObjetivo;
    return categoriaActiva?.margenSugerido ?? 70;
  }, [usarMargenPersonalizado, margenObjetivo, categoriaActiva]);

  const resultado = useMemo(() => {
    return calcularCosteoDirecto({
      costoIngredientes,
      rendimiento,
      empaque,
      otrosDirectos,
      multiplicador,
      precioVenta,
    });
  }, [costoIngredientes, rendimiento, empaque, otrosDirectos, multiplicador, precioVenta]);

  const precioSugerido = useMemo(() => {
    if (resultado.costoRealUnitario <= 0) return 0;
    const factor = 1 - margenActivo / 100;
    return factor > 0 ? resultado.costoRealUnitario / factor : 0;
  }, [resultado.costoRealUnitario, margenActivo]);

  const puntoEquilibrio = useMemo(() => {
    const margenContribucion = precioVenta - resultado.costoRealUnitario;
    if (margenContribucion <= 0) return { unidades: 0, soles: 0 };
    const unidades = Math.ceil(costosFijosMensuales / margenContribucion);
    const soles = unidades * precioVenta;
    return { unidades, soles };
  }, [precioVenta, resultado.costoRealUnitario, costosFijosMensuales]);

  function resetear() {
    setEmpaque(EMPAQUE_DEFAULT);
    setOtrosDirectos(OTROS_DIRECTOS_DEFAULT);
    setMultiplicador(MULTIPLICADOR_DEFAULT);
    setCategoriaId("tortas-autor");
    setUsarMargenPersonalizado(false);
    setCostosFijosMensuales(4400);
    toast.success("Valores reiniciados a los defaults.");
  }

  const resumenCopiable = `📊 COSTEO REAL — ${productoNombre || "Producto"}
═══════════════════════════════════

FASE 1 · Ingredientes (receta FoodOS):
  Rinde: ${rendimiento} porciones
  Costo ingredientes: S/ ${resultado.costoIngredientes.toFixed(2)}/porción

FASE 2 · Costos directos por unidad:
  Empaque: S/ ${empaque.toFixed(2)}
  Otros directos: S/ ${otrosDirectos.toFixed(2)}
  Subtotal: S/ ${resultado.subtotalDirectos.toFixed(2)}

FASE 3 · Overhead (multiplicador ×${multiplicador}):
  S/ ${resultado.costoIngredientes.toFixed(2)} × ${multiplicador} = S/ ${resultado.costoIngredientesConOverhead.toFixed(2)}
  (incluye S/ ${resultado.costoOverhead.toFixed(2)} de planilla, alquiler, luz, etc.)

═══════════════════════════════════
  COSTO REAL: S/ ${resultado.costoRealUnitario.toFixed(2)}/unidad
  PRECIO ACTUAL: S/ ${precioVenta.toFixed(2)}
  GANANCIA REAL: S/ ${resultado.gananciaReal.toFixed(2)} (${resultado.margenRealPct}%)
  PRECIO SUGERIDO (margen ${margenActivo}%): S/ ${precioSugerido.toFixed(2)}
═══════════════════════════════════
  ${resultado.diagnostico}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Costeo Real por Producto
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tres capas conectadas: receta → costos directos → overhead. Sin números sueltos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(resumenCopiable);
              toast.success("Diagnóstico copiado al portapapeles.");
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" /> Copiar
          </button>
          <button
            type="button"
            onClick={resetear}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Seleccionar producto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label htmlFor={idProducto} className="mb-2 block text-sm font-bold text-slate-800">
          <Cake className="mr-1.5 inline h-4 w-4 text-blue-600" />
          Producto a costear
        </label>

        {productosExistentes.length > 0 ? (
          <select
            id={idProducto}
            onChange={handleSelectProducto}
            value={productoId}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-800"
          >
            <option value="">Seleccionar de tus recetas FoodOS…</option>
            {productosExistentes.map(prod => (
              <option key={prod.id} value={prod.id}>
                {prod.nombre} — ingredientes: S/ {(Number(prod.precio_costo) || 0).toFixed(2)}
                {Number(prod.precio_venta) > 0 && ` · precio: S/ ${Number(prod.precio_venta).toFixed(2)}`}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
            No tienes productos con receta aún. Crea uno en{" "}
            <strong>Productos & Recetas → Nuevo Producto</strong> para que aparezca aquí.
          </div>
        )}

        {productoId && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Rendimiento (porciones)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={rendimiento}
                onChange={e => setRendimiento(Number(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-slate-500">
                Costo ingredientes (S/ total receta)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={costoIngredientes}
                onChange={e => setCostoIngredientes(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {productoId && (
        <>
          {/* FASE 1: Ingredientes */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">1</span>
              <h3 className="text-base font-bold text-emerald-900">Ingredientes (automático de tu receta)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase text-emerald-500">Costo por porción</p>
                <p className="text-2xl font-black text-emerald-800">
                  S/ {resultado.costoIngredientes.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm">
                <p className="text-[11px] font-bold uppercase text-emerald-500">Total de la receta</p>
                <p className="text-2xl font-black text-emerald-800">
                  S/ {costoIngredientes.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* FASE 2: Costos directos */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">2</span>
              <h3 className="text-base font-bold text-blue-900">Costos Directos por Unidad</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={idEmpaque} className="mb-1 block text-xs font-bold text-blue-700">
                  Empaque (caja, base, lazo, sticker)
                </label>
                <input
                  id={idEmpaque}
                  type="number"
                  step="0.5"
                  min="0"
                  value={empaque}
                  onChange={e => setEmpaque(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-blue-300 bg-white p-2 text-sm font-bold text-blue-800"
                />
              </div>
              <div>
                <label htmlFor={idOtrosDirectos} className="mb-1 block text-xs font-bold text-blue-700">
                  Otros directos (comisión pasarela, gas)
                </label>
                <input
                  id={idOtrosDirectos}
                  type="number"
                  step="0.5"
                  min="0"
                  value={otrosDirectos}
                  onChange={e => setOtrosDirectos(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-blue-300 bg-white p-2 text-sm font-bold text-blue-800"
                />
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-white px-4 py-2 text-center shadow-sm">
              <p className="text-sm font-bold text-blue-800">
                Subtotal directos: S/ {resultado.subtotalDirectos.toFixed(2)}
              </p>
            </div>
          </div>

          {/* FASE 3: Overhead */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white">3</span>
              <h3 className="text-base font-bold text-amber-900">Overhead (Multiplicador)</h3>
            </div>
            <p className="mb-3 text-xs text-amber-700">
              (Fijos mensuales + Planilla) ÷ Insumos del mes. Solo multiplica los{" "}
              <strong>ingredientes</strong> — el empaque y la comisión son directos.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  id={idMultiplicador}
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={multiplicador}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (Number.isFinite(val) && val >= 1 && val <= 5) {
                      setMultiplicador(val);
                    }
                  }}
                  className="w-full rounded-lg border-2 border-amber-300 bg-white px-4 py-2 text-xl font-black text-amber-800"
                />
                <p className="mt-1 text-[11px] text-amber-600">
                  1.0 = solo ingredientes · 1.4 = típico · 1.8 = alto overhead
                </p>
              </div>
              <div className="flex gap-1.5">
                {[1.2, 1.4, 1.6, 1.8].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMultiplicador(preset)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      multiplicador === preset
                        ? "bg-amber-600 text-white"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-white px-4 py-2 text-sm text-center shadow-sm">
              <span className="font-bold text-slate-600">
                S/ {resultado.costoIngredientes.toFixed(2)} × {multiplicador} ={" "}
              </span>
              <span className="font-black text-amber-800">
                S/ {resultado.costoIngredientesConOverhead.toFixed(2)}
              </span>
              <span className="ml-2 text-xs text-slate-400">
                (S/ {resultado.costoOverhead.toFixed(2)} de overhead)
              </span>
            </div>
          </div>

          {/* RESULTADO: Costo Real */}
          <div className={`rounded-2xl border-2 p-6 shadow-md ${
            resultado.estado === "optimo" ? "border-emerald-300 bg-emerald-50" :
            resultado.estado === "alerta" ? "border-amber-300 bg-amber-50" :
            "border-red-300 bg-red-50"
          }`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Costo Real</p>
                <p className="text-3xl font-black text-slate-900">
                  S/ {resultado.costoRealUnitario.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Precio Venta</p>
                <input
                  id={idPrecioVenta}
                  type="number"
                  step="0.5"
                  min="0"
                  value={precioVenta}
                  onChange={e => setPrecioVenta(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-2xl font-black text-slate-900"
                />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase text-slate-500">Ganancia Real</p>
                <p className={`text-3xl font-black ${
                  resultado.gananciaReal > 0 ? "text-emerald-700" : "text-red-700"
                }`}>
                  S/ {resultado.gananciaReal.toFixed(2)}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${
                resultado.margenRealPct > 50
                  ? "bg-emerald-600"
                  : resultado.margenRealPct > 30
                    ? "bg-amber-500"
                    : "bg-red-600"
              }`}>
                <p className="text-[11px] font-bold uppercase text-white/80">Margen Utilidad</p>
                <p className="text-4xl font-black text-white leading-none">
                  {resultado.margenRealPct}%
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border-l-4 border-current bg-white/60 px-4 py-3 text-sm">
              {resultado.diagnostico}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-600">
                  Margen objetivo:
                </span>
                {!usarMargenPersonalizado ? (
                  <select
                    value={categoriaId}
                    onChange={e => setCategoriaId(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    {CATEGORIAS_MARGEN_SUGERIDO.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre} ({cat.margenSugerido}%)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={margenObjetivo}
                    onChange={e => setMargenObjetivo(Number(e.target.value) || 70)}
                    className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-700"
                  />
                )}
                <label className="flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={usarMargenPersonalizado}
                    onChange={e => setUsarMargenPersonalizado(e.target.checked)}
                  />
                  Personalizado
                </label>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Precio sugerido</p>
                <p className="text-xl font-black text-slate-800">
                  S/ {precioSugerido.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Desglose visual de las 3 fases */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-800">
              Desglose paso a paso
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-2">
                <span className="text-emerald-700">🟢 Ingredientes (receta):</span>
                <span className="font-bold text-emerald-800">S/ {resultado.costoIngredientes.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50/50 px-4 py-2">
                <span className="text-emerald-600">   + Overhead (×{multiplicador}):</span>
                <span className="font-bold text-emerald-700">S/ {resultado.costoOverhead.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
                <span className="text-blue-700">🔵 Empaque:</span>
                <span className="font-bold text-blue-800">S/ {empaque.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50/50 px-4 py-2">
                <span className="text-blue-700">   + Otros directos:</span>
                <span className="font-bold text-blue-800">S/ {otrosDirectos.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white">
                <span className="font-bold">= COSTO REAL:</span>
                <span className="text-lg font-black">S/ {resultado.costoRealUnitario.toFixed(2)}</span>
              </div>
              <div className={`mt-1 flex items-center justify-between rounded-lg px-4 py-2.5 text-white ${
                resultado.margenRealPct > 50
                  ? "bg-emerald-600"
                  : resultado.margenRealPct > 30
                    ? "bg-amber-500"
                    : "bg-red-600"
              }`}>
                <span className="font-bold text-sm">
                  {resultado.margenRealPct > 50 ? "✅" : resultado.margenRealPct > 30 ? "⚠️" : "🚨"}
                  {" "}MARGEN UTILIDAD: {resultado.margenRealPct}%
                </span>
                <span className="font-bold text-sm">
                  Ganancia: S/ {resultado.gananciaReal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Punto de equilibrio (opcional, plegable) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setMostrarPuntoEquilibrio(!mostrarPuntoEquilibrio)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <TrendingUp className="h-4 w-4 text-slate-600" />
                Punto de Equilibrio Mensual (opcional)
              </span>
              {mostrarPuntoEquilibrio ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {mostrarPuntoEquilibrio && (
              <div className="border-t px-5 py-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Costos fijos mensuales (S/)
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="0"
                      value={costosFijosMensuales}
                      onChange={e => setCostosFijosMensuales(Number(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Unidades estimadas por mes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={unidadesMensualesEstimadas}
                      onChange={e => setUnidadesMensualesEstimadas(Number(e.target.value) || 1)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-100 p-3">
                    <p className="text-[11px] font-bold uppercase text-slate-500">
                      Unidades para equilibrio
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {puntoEquilibrio.unidades}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-3">
                    <p className="text-[11px] font-bold uppercase text-slate-500">
                      Facturar mínimo
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      S/ {puntoEquilibrio.soles.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-3">
                    <p className="text-[11px] font-bold uppercase text-slate-500">
                      {unidadesMensualesEstimadas >= puntoEquilibrio.unidades ? "Sobres el mínimo" : "Bajo el mínimo"}
                    </p>
                    <p className={`text-xl font-black ${
                      unidadesMensualesEstimadas >= puntoEquilibrio.unidades ? "text-emerald-700" : "text-red-700"
                    }`}>
                      {unidadesMensualesEstimadas - puntoEquilibrio.unidades >= 0 ? "+" : ""}
                      {unidadesMensualesEstimadas - puntoEquilibrio.unidades} unidades
                    </p>
                  </div>
                </div>

                {puntoEquilibrio.unidades === 0 && (
                  <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                    Tu precio de venta no cubre el costo real. No hay punto de equilibrio posible — sube el precio.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!productoId && productosExistentes.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <Info className="mr-1.5 inline h-4 w-4" />
          Selecciona un producto arriba para ver su costeo real completo en 3 capas.
        </div>
      )}
    </div>
  );
}
