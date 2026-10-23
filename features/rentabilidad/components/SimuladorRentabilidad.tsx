"use client";

import { useState, useId, useMemo, useTransition, useEffect, useRef } from "react";
import {
  Cake, Copy, AlertTriangle, Info, Target,
  ChevronDown, ChevronUp, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { ProductoPreset } from "../types/rentabilidad.types";
import type { DesgloseCosteo } from "../services/costeo-real.service";
import {
  guardarEmpaqueAction,
  eliminarEmpaqueAction,
} from "../actions/empaques.action";
import {
  guardarManoObraAction,
  eliminarManoObraAction,
  guardarCostoFijoAction,
  eliminarCostoFijoAction,
  guardarConfiguracionCosteoAction,
} from "../actions/costeo-config.action";

type Props = {
  productosExistentes: ProductoPreset[];
  costeosIniciales: Record<string, DesgloseCosteo | null>;
};

export function SimuladorRentabilidad({ productosExistentes, costeosIniciales }: Props) {
  const [productoId, setProductoId] = useState("");
  const [margenObjetivo, setMargenObjetivo] = useState(45);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Estado editable de empaques
  const [empaquesEdit, setEmpaquesEdit] = useState<
    Array<{ id?: string; nombre: string; cantidad: string; costo_unitario: string; _nuevo?: boolean }>
  >([]);
  const [guardandoEmpaque, startEmpaqueTransition] = useTransition();

  // Estado editable de mano de obra
  const [manoObraEdit, setManoObraEdit] = useState<
    Array<{ id?: string; fase: string; minutos_activos: string; minutos_pasivos: string; _nuevo?: boolean }>
  >([]);
  const [guardandoManoObra, startManoObraTransition] = useTransition();

  // Estado editable de costos fijos
  const [costosFijosEdit, setCostosFijosEdit] = useState<
    Array<{ id?: string; concepto: string; monto_mensual: string; _nuevo?: boolean }>
  >([]);
  const [guardandoFijos, startFijosTransition] = useTransition();

  // Configuración editable
  const [unidadesCapacidad, setUnidadesCapacidad] = useState("120");
  const [costoMinuto, setCostoMinuto] = useState("0.0833");
  const [guardandoConfig, startConfigTransition] = useTransition();

  const COMISION_PASARELA_PCT = 3.99; // Culqi: 3.99% del precio de venta

  const FASES_MANO_OBRA = [
    "preparacion",
    "horneado",
    "decoracion",
    "acabado",
    "limpieza",
    "empaque",
  ];

  const CATEGORIAS_EMPAQUE = [
    "Caja para Torta",
    "Caja para Kekes",
    "Caja para Galletas",
    "Caja para Donas",
    "Caja para Macarrones",
    "Base rígida",
    "Blonda",
    "Sticker / Etiqueta",
    "Cinta / Lazo",
    "Bolsa de regalo",
  ];

  const idProducto = useId();
  const idMargen = useId();

  const costeo = useMemo(() => {
    return costeosIniciales[productoId] ?? null;
  }, [productoId, costeosIniciales]);

  const producto = useMemo(() => {
    return productosExistentes.find(p => p.id === productoId) ?? null;
  }, [productoId, productosExistentes]);

  // Cargar TODO al cambiar de producto (una sola vez por producto)
  const productoSyncRef = useRef<string>("");
  const configSyncRef = useRef(false);

  useEffect(() => {
    if (!productoId || !costeo) return;
    if (productoSyncRef.current === productoId) return;

    productoSyncRef.current = productoId;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmpaquesEdit(
      costeo.empaques.map(e => ({
        nombre: e.nombre,
        cantidad: String(e.cantidad),
        costo_unitario: String(e.costoUnitario),
      }))
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManoObraEdit(
      costeo.manoObra.map(m => ({
        id: m.id,
        fase: m.fase,
        minutos_activos: String(m.minutosActivos),
        minutos_pasivos: String(m.minutosPasivos),
      }))
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCostosFijosEdit(
      costeo.costosFijos.map(c => ({
        id: c.id,
        concepto: c.concepto,
        monto_mensual: String(c.montoMensual),
      }))
    );

    // Sincronizar capacidad desde el servicio (por producto)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnidadesCapacidad(String(costeo.unidadesMensualesCapacidad));

    // Costo por minuto: global, solo se inicializa UNA VEZ (no por producto)
    if (!configSyncRef.current) {
      configSyncRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCostoMinuto(String(costeo.costoPorMinuto));
    }
  }, [productoId, costeo]);

  // ── Totales calculados en CADA render desde los valores editados ──
  const totalesLocales = (() => {
    if (!costeo) return null;

    const costoIng = costeo.costoIngredientes;

    const costoEmp = empaquesEdit.reduce(
      (t, e) => t + (Number(e.cantidad) || 1) * (Number(e.costo_unitario) || 0),
      0
    );

    const precioVentaParaComision = Number(producto?.precio_venta) || 0;
    const comision = Math.round(precioVentaParaComision * (COMISION_PASARELA_PCT / 100) * 100) / 100;

    const costoMO =
      manoObraEdit.reduce(
        (t, m) => t + (Number(m.minutos_activos) || 0) * (Number(costoMinuto) || 0.0833),
        0
      ) / Math.max(1, costeo.rendimiento);

    const costoVariable = costoIng + costoEmp + costoMO + comision;

    const totalFijos = costosFijosEdit.reduce(
      (t, c) => t + (Number(c.monto_mensual) || 0),
      0
    );
    const capacidad = Math.max(1, Number(unidadesCapacidad) || 120);
    const indirectos = totalFijos / capacidad;

    const costoCompleto = costoVariable + indirectos;

    const precio = Number(producto?.precio_venta) || 0;
    const margenContribucion = precio - costoVariable;
    const margenContribucionPct = precio > 0 ? (margenContribucion / precio) * 100 : 0;
    const margenBrutoPct = precio > 0 ? ((precio - costoCompleto) / precio) * 100 : 0;

    const margenObj = margenObjetivo;
    const sugerido = margenObj < 100 ? costoCompleto / (1 - margenObj / 100) : 0;

    return {
      costoIng: Math.round(costoIng * 100) / 100,
      costoEmp: Math.round(costoEmp * 100) / 100,
      comision: Math.round(comision * 100) / 100,
      costoMO: Math.round(costoMO * 100) / 100,
      costoVariable: Math.round(costoVariable * 100) / 100,
      totalFijos: Math.round(totalFijos),
      capacidad,
      indirectos: Math.round(indirectos * 100) / 100,
      costoCompleto: Math.round(costoCompleto * 100) / 100,
      margenContribucion: Math.round(margenContribucion * 100) / 100,
      margenContribucionPct: Math.round(margenContribucionPct * 10) / 10,
      margenBrutoPct: Math.round(margenBrutoPct * 10) / 10,
      sugerido: Math.round(sugerido * 100) / 100,
      minimo: Math.round(costoCompleto * 100) / 100,
    };
  })();

  async function guardarEmpaque(index: number) {
    const emp = empaquesEdit[index];
    if (!emp || !productoId) return;

    startEmpaqueTransition(async () => {
      const res = await guardarEmpaqueAction({
        id: emp.id,
        producto_id: productoId,
        nombre: emp.nombre,
        cantidad: Number(emp.cantidad) || 1,
        costo_unitario: Number(emp.costo_unitario) || 0,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        emp._nuevo
          ? `"${emp.nombre}" agregado al producto.`
          : `"${emp.nombre}" actualizado.`
      );

      setEmpaquesEdit(prev =>
        prev.map((e, i) => (i === index ? { ...e, _nuevo: false } : e))
      );
    });
  }

  async function eliminarEmpaque(index: number) {
    const emp = empaquesEdit[index];
    if (!emp) return;

    if (!window.confirm(`¿Eliminar "${emp.nombre}" de este producto?`)) return;

    if (emp.id) {
      startEmpaqueTransition(async () => {
        const res = await eliminarEmpaqueAction(emp.id!);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Empaque eliminado.");
      });
    }

    setEmpaquesEdit(prev => prev.filter((_, i) => i !== index));
  }

  function agregarFilaEmpaque() {
    setEmpaquesEdit(prev => [
      ...prev,
      { nombre: "", cantidad: "1", costo_unitario: "", _nuevo: true },
    ]);
  }

  // ── Mano de obra ──
  async function guardarManoObra(index: number) {
    const mo = manoObraEdit[index];
    if (!mo || !productoId) return;

    startManoObraTransition(async () => {
      const res = await guardarManoObraAction({
        id: mo.id,
        producto_id: productoId,
        fase: mo.fase,
        minutos_activos: Number(mo.minutos_activos) || 0,
        minutos_pasivos: Number(mo.minutos_pasivos) || 0,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        mo._nuevo
          ? `Fase "${mo.fase}" registrada.`
          : `Fase "${mo.fase}" actualizada.`
      );

      setManoObraEdit(prev =>
        prev.map((m, i) => (i === index ? { ...m, _nuevo: false } : m))
      );
    });
  }

  async function eliminarManoObra(index: number) {
    const mo = manoObraEdit[index];
    if (!mo) return;

    if (!window.confirm(`¿Eliminar la fase "${mo.fase}"?`)) return;

    if (mo.id) {
      startManoObraTransition(async () => {
        const res = await eliminarManoObraAction(mo.id!);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Fase eliminada.");
      });
    }

    setManoObraEdit(prev => prev.filter((_, i) => i !== index));
  }

  function agregarFilaManoObra() {
    setManoObraEdit(prev => [
      ...prev,
      { fase: "", minutos_activos: "", minutos_pasivos: "0", _nuevo: true },
    ]);
  }

  // ── Costos fijos ──
  async function guardarCostoFijo(index: number) {
    const cf = costosFijosEdit[index];
    if (!cf) return;

    startFijosTransition(async () => {
      const res = await guardarCostoFijoAction({
        id: cf.id,
        concepto: cf.concepto,
        monto_mensual: Number(cf.monto_mensual) || 0,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        cf._nuevo
          ? `"${cf.concepto}" registrado.`
          : `"${cf.concepto}" actualizado.`
      );

      setCostosFijosEdit(prev =>
        prev.map((c, i) => (i === index ? { ...c, _nuevo: false } : c))
      );
    });
  }

  async function eliminarCostoFijo(index: number) {
    const cf = costosFijosEdit[index];
    if (!cf) return;

    if (!window.confirm(`¿Eliminar "${cf.concepto}"?`)) return;

    if (cf.id) {
      startFijosTransition(async () => {
        const res = await eliminarCostoFijoAction(cf.id!);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Costo fijo eliminado.");
      });
    }

    setCostosFijosEdit(prev => prev.filter((_, i) => i !== index));
  }

  function agregarFilaCostoFijo() {
    setCostosFijosEdit(prev => [
      ...prev,
      { concepto: "", monto_mensual: "", _nuevo: true },
    ]);
  }

  // ── Configuración (comisión, capacidad, costo minuto) ──
  async function guardarConfiguracion() {
    startConfigTransition(async () => {
      const res = await guardarConfiguracionCosteoAction({
        unidades_capacidad: Number(unidadesCapacidad) || 120,
        costo_minuto: Number(costoMinuto) || 0.0833,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Configuración de costeo guardada.");
    });
  }

  // ── Precio sugerido y mínimo (calculados directamente, sin useMemo) ──
  const costoCompletoActual = totalesLocales?.costoCompleto ?? 0;
  const margenFactor = 1 - margenObjetivo / 100;
  const precioSugerido =
    costoCompletoActual > 0 && margenFactor > 0
      ? costoCompletoActual / margenFactor
      : 0;
  const precioMinimo = costoCompletoActual;

  function copiar() {
    if (!totalesLocales || !costeo || !producto) return;

    const texto = `📊 COSTEO REAL — ${producto.nombre}
═══════════════════════════════════

CAPA 1 · INGREDIENTES (receta FoodOS):
  Rinde: ${costeo.rendimiento} porciones
  Costo ingredientes: S/ ${totalesLocales.costoIng.toFixed(2)}/porción

CAPA 2 · EMPAQUES Y DIRECTOS:
  Empaques: S/ ${totalesLocales.costoEmp.toFixed(2)}
  Comisión pasarela: S/ ${totalesLocales.comision.toFixed(2)}

CAPA 3 · MANO DE OBRA DIRECTA:
  Costo por minuto: S/ ${Number(costoMinuto).toFixed(4)}
  Costo asignado: S/ ${totalesLocales.costoMO.toFixed(2)}/porción

CAPA 4 · COSTOS INDIRECTOS:
  Fijos mensuales: S/ ${totalesLocales.totalFijos}
  Capacidad: ${totalesLocales.capacidad} unidades/mes
  Asignado por unidad: S/ ${totalesLocales.indirectos.toFixed(2)}

═══════════════════════════════════
  COSTO VARIABLE: S/ ${totalesLocales.costoVariable.toFixed(2)}
  COSTO COMPLETO: S/ ${totalesLocales.costoCompleto.toFixed(2)}
  PRECIO ACTUAL: S/ ${Number(producto.precio_venta || 0).toFixed(2)}
  MARGEN CONTRIBUCIÓN: S/ ${totalesLocales.margenContribucion.toFixed(2)} (${totalesLocales.margenContribucionPct}%)
  MARGEN BRUTO: ${totalesLocales.margenBrutoPct}%
═══════════════════════════════════
  PRECIO MÍNIMO SOSTENIBLE: S/ ${precioMinimo.toFixed(2)}
  PRECIO SUGERIDO (margen ${margenObjetivo}%): S/ ${precioSugerido.toFixed(2)}`;

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
          {/* ─── HERO: Diagnóstico del producto ─── */}
          <div className={`rounded-3xl border-2 p-6 shadow-lg sm:p-8 ${
            (totalesLocales?.margenBrutoPct ?? 0) > 40
              ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
              : (totalesLocales?.margenBrutoPct ?? 0) > 20
                ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
                : "border-red-300 bg-gradient-to-br from-red-50 to-white"
          }`}>
            <div className="mb-6 text-center">
              <p className={`text-sm font-semibold ${
                (totalesLocales?.margenBrutoPct ?? 0) > 40 ? "text-emerald-700"
                : (totalesLocales?.margenBrutoPct ?? 0) > 20 ? "text-amber-700"
                : "text-red-700"
              }`}>
                {producto.nombre}
              </p>
              <div className={`mx-auto mt-2 inline-flex items-center gap-3 rounded-2xl px-8 py-4 shadow-xl ${
                (totalesLocales?.margenBrutoPct ?? 0) > 40 ? "bg-emerald-600"
                : (totalesLocales?.margenBrutoPct ?? 0) > 20 ? "bg-amber-500"
                : "bg-red-600"
              }`}>
                <span className="text-5xl font-black text-white sm:text-7xl">
                  {(totalesLocales?.margenBrutoPct ?? 0)}%
                </span>
              </div>
              <p className={`mt-3 text-sm font-medium ${
                (totalesLocales?.margenBrutoPct ?? 0) > 40 ? "text-emerald-800"
                : (totalesLocales?.margenBrutoPct ?? 0) > 20 ? "text-amber-800"
                : "text-red-800"
              }`}>
                {(totalesLocales?.margenBrutoPct ?? 0) > 40
                  ? "✅ Margen saludable — este producto es rentable"
                  : (totalesLocales?.margenBrutoPct ?? 0) > 20
                    ? "⚠️ Margen ajustado — revisa tus costos o sube el precio"
                    : "🚨 Margen crítico — a este precio pierdes dinero"
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Precio venta</p>
                <p className="mt-1 text-xl font-black text-slate-800">
                  S/ {Number(producto.precio_venta || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Costo variable</p>
                <p className="mt-1 text-xl font-black text-slate-800">
                  S/ {(totalesLocales?.costoVariable ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Costo completo</p>
                <p className="mt-1 text-xl font-black text-slate-800">
                  S/ {(totalesLocales?.costoCompleto ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ganancia real</p>
                <p className={`mt-1 text-xl font-black ${
                  (totalesLocales?.margenContribucion ?? 0) > 0 ? "text-emerald-700" : "text-red-700"
                }`}>
                  S/ {(totalesLocales?.margenContribucion ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {totalesLocales && totalesLocales.costoCompleto > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ¿A dónde se va cada sol de la venta?
                </p>
                <div className="flex h-12 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  {(() => {
                    const total = Number(producto.precio_venta) || 1;
                    const pct = (v: number) => Math.max(0, Math.min(100, (v / total) * 100));
                    const ganancia = Math.max(0, total - totalesLocales.costoCompleto);
                    return (
                      <>
                        <div
                          className="flex items-center justify-center bg-emerald-600 text-[10px] font-bold text-white transition-all"
                          style={{ width: `${pct(totalesLocales.costoIng)}%` }}
                          title={`Ingredientes: S/ ${totalesLocales.costoIng}`}
                        >
                          {pct(totalesLocales.costoIng) > 8 && `${pct(totalesLocales.costoIng).toFixed(0)}%`}
                        </div>
                        <div
                          className="flex items-center justify-center bg-blue-500 text-[10px] font-bold text-white"
                          style={{ width: `${pct(totalesLocales.costoEmp + totalesLocales.comision)}%` }}
                          title={`Empaques + comisión: S/ ${(totalesLocales.costoEmp + totalesLocales.comision).toFixed(2)}`}
                        >
                          {pct(totalesLocales.costoEmp + totalesLocales.comision) > 8 && `${pct(totalesLocales.costoEmp + totalesLocales.comision).toFixed(0)}%`}
                        </div>
                        <div
                          className="flex items-center justify-center bg-amber-500 text-[10px] font-bold text-white"
                          style={{ width: `${pct(totalesLocales.costoMO)}%` }}
                          title={`Mano de obra: S/ ${totalesLocales.costoMO}`}
                        >
                          {pct(totalesLocales.costoMO) > 8 && `${pct(totalesLocales.costoMO).toFixed(0)}%`}
                        </div>
                        <div
                          className="flex items-center justify-center bg-slate-600 text-[10px] font-bold text-white"
                          style={{ width: `${pct(totalesLocales.indirectos)}%` }}
                          title={`Indirectos: S/ ${totalesLocales.indirectos}`}
                        >
                          {pct(totalesLocales.indirectos) > 8 && `${pct(totalesLocales.indirectos).toFixed(0)}%`}
                        </div>
                        <div
                          className={`flex items-center justify-center text-[10px] font-bold text-white ${
                            ganancia > 0 ? "bg-emerald-800" : "bg-red-800"
                          }`}
                          style={{ width: `${pct(ganancia)}%` }}
                          title={`Ganancia: S/ ${ganancia.toFixed(2)}`}
                        >
                          {pct(ganancia) > 8 && ganancia > 0 ? "💰" : ganancia <= 0 ? "❌" : ""}
                          {pct(ganancia) > 8 && `${pct(ganancia).toFixed(0)}%`}
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[10px] font-medium text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Ingredientes</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Empaques + comisión</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Mano de obra</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-600" /> Indirectos</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-800" /> Tu ganancia</span>
                </div>
              </div>
            )}
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
                    Empaques y Directos
                  </h4>

                  <div className="space-y-2">
                    {empaquesEdit.map((emp, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-2 rounded-md border border-blue-100 bg-blue-50/60 p-2">
                        <div className="min-w-[160px] flex-1">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-blue-600">Componente</label>
                          {emp._nuevo ? (
                            <input
                              list="categorias-empaque"
                              value={emp.nombre}
                              onChange={e => {
                                const newEmpaques = [...empaquesEdit];
                                newEmpaques[index] = { ...emp, nombre: e.target.value };
                                setEmpaquesEdit(newEmpaques);
                              }}
                              placeholder="Ej: Caja para Torta"
                              className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs"
                            />
                          ) : (
                            <input
                              value={emp.nombre}
                              onChange={e => {
                                const newEmpaques = [...empaquesEdit];
                                newEmpaques[index] = { ...emp, nombre: e.target.value };
                                setEmpaquesEdit(newEmpaques);
                              }}
                              className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-xs"
                            />
                          )}
                        </div>
                        <div className="w-20">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-blue-600">Cant.</label>
                          <input
                            type="number"
                            step="any"
                            min="0.001"
                            value={emp.cantidad}
                            onChange={e => {
                              const newEmpaques = [...empaquesEdit];
                              newEmpaques[index] = { ...emp, cantidad: e.target.value };
                              setEmpaquesEdit(newEmpaques);
                            }}
                            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-center text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-blue-600">Costo/und (S/)</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={emp.costo_unitario}
                            onChange={e => {
                              const newEmpaques = [...empaquesEdit];
                              newEmpaques[index] = { ...emp, costo_unitario: e.target.value };
                              setEmpaquesEdit(newEmpaques);
                            }}
                            className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-center text-xs"
                          />
                        </div>
                        <div className="flex items-end gap-1">
                          <button
                            type="button"
                            onClick={() => void guardarEmpaque(index)}
                            disabled={guardandoEmpaque}
                            className="rounded bg-blue-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {emp._nuevo ? "Agregar" : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void eliminarEmpaque(index)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            aria-label="Eliminar empaque"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <datalist id="categorias-empaque">
                      {CATEGORIAS_EMPAQUE.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>

                    <button
                      type="button"
                      onClick={agregarFilaEmpaque}
                      className="flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
                    >
                      <Plus className="h-3.5 w-3.5" /> Añadir componente de empaque
                    </button>

                    <div className="flex justify-between items-end rounded bg-blue-50/80 px-3 py-2 text-xs gap-2">
                      <span className="text-blue-700">
                        Comisión pasarela
                        <span className="ml-1 text-[10px] text-blue-500">
                          ({COMISION_PASARELA_PCT}% del precio)
                        </span>
                      </span>
                      <span className="font-bold text-blue-800">
                        S/ {(totalesLocales?.comision ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between rounded bg-blue-100 px-3 py-2 text-sm font-bold">
                      <span className="text-blue-800">Total empaques y directos:</span>
                      <span className="text-blue-900">
                        S/ {(
                          empaquesEdit.reduce((t, e) => t + (Number(e.cantidad) || 1) * (Number(e.costo_unitario) || 0), 0) +
                          (totalesLocales?.comision ?? 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capa 3: Mano de obra */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">3</span>
                    Mano de Obra Directa
                  </h4>

                  <div className="space-y-2">
                    {manoObraEdit.map((mo, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-2 rounded-md border border-amber-100 bg-amber-50/60 p-2">
                        <div className="min-w-[120px] flex-1">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-amber-600">Fase</label>
                          <input
                            list="fases-mano-obra"
                            value={mo.fase}
                            onChange={e => {
                              const newMO = [...manoObraEdit];
                              newMO[index] = { ...mo, fase: e.target.value };
                              setManoObraEdit(newMO);
                            }}
                            placeholder="Ej: decoración"
                            className="w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-amber-600">Min activos</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={mo.minutos_activos}
                            onChange={e => {
                              const newMO = [...manoObraEdit];
                              newMO[index] = { ...mo, minutos_activos: e.target.value };
                              setManoObraEdit(newMO);
                            }}
                            className="w-full rounded border border-amber-300 bg-white px-2 py-1 text-center text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-amber-600">Min pasivos</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={mo.minutos_pasivos}
                            onChange={e => {
                              const newMO = [...manoObraEdit];
                              newMO[index] = { ...mo, minutos_pasivos: e.target.value };
                              setManoObraEdit(newMO);
                            }}
                            className="w-full rounded border border-amber-300 bg-white px-2 py-1 text-center text-xs"
                            title="Minutos de horno/refrigeración: no se cobran como capacidad activa"
                          />
                        </div>
                        <div className="flex items-end gap-1">
                          <span className="pb-1.5 text-[10px] font-bold text-amber-700">
                            S/ {((Number(mo.minutos_activos) || 0) * (Number(costoMinuto) || 0.0833)).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => void guardarManoObra(index)}
                            disabled={guardandoManoObra}
                            className="rounded bg-amber-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            {mo._nuevo ? "Agregar" : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void eliminarManoObra(index)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            aria-label="Eliminar fase"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <datalist id="fases-mano-obra">
                      {FASES_MANO_OBRA.map(f => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>

                    <button
                      type="button"
                      onClick={agregarFilaManoObra}
                      className="flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-200"
                    >
                      <Plus className="h-3.5 w-3.5" /> Añadir fase de trabajo
                    </button>

                    <div className="flex flex-wrap items-end justify-between gap-2 rounded bg-amber-50 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700">Costo por minuto:</span>
                        <span className="text-[10px] text-amber-500">S/</span>
                        <input
                          type="number"
                          step="0.0001"
                          min="0.001"
                          value={costoMinuto}
                          onChange={e => setCostoMinuto(e.target.value)}
                          className="w-20 rounded border border-amber-300 bg-white px-2 py-1 text-center text-xs font-bold text-amber-800"
                          title="Planilla mensual + cargas ÷ 60,000 minutos/mes"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-800">
                          Total: S/ {(
                            manoObraEdit.reduce((t, m) =>
                              t + (Number(m.minutos_activos) || 0) * (Number(costoMinuto) || 0.0833), 0
                            ) / Math.max(1, costeo.rendimiento)
                          ).toFixed(2)}/porción
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capa 4: Indirectos */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-black text-white">4</span>
                    Costos Indirectos (fijos mensuales)
                  </h4>

                  <div className="space-y-2">
                    {costosFijosEdit.map((cf, index) => (
                      <div key={index} className="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                        <div className="min-w-[140px] flex-1">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-slate-600">Concepto</label>
                          <input
                            value={cf.concepto}
                            onChange={e => {
                              const newCF = [...costosFijosEdit];
                              newCF[index] = { ...cf, concepto: e.target.value };
                              setCostosFijosEdit(newCF);
                            }}
                            placeholder="Ej: Alquiler, Luz, Planilla"
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                          />
                        </div>
                        <div className="w-28">
                          <label className="mb-0.5 block text-[10px] font-bold uppercase text-slate-600">Monto/mes (S/)</label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={cf.monto_mensual}
                            onChange={e => {
                              const newCF = [...costosFijosEdit];
                              newCF[index] = { ...cf, monto_mensual: e.target.value };
                              setCostosFijosEdit(newCF);
                            }}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs"
                          />
                        </div>
                        <div className="flex items-end gap-1">
                          <button
                            type="button"
                            onClick={() => void guardarCostoFijo(index)}
                            disabled={guardandoFijos}
                            className="rounded bg-slate-700 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            {cf._nuevo ? "Agregar" : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void eliminarCostoFijo(index)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50"
                            aria-label="Eliminar costo fijo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={agregarFilaCostoFijo}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      <Plus className="h-3.5 w-3.5" /> Añadir costo fijo mensual
                    </button>

                    <div className="flex flex-wrap items-end justify-between gap-3 rounded bg-slate-100 px-3 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">Capacidad productiva (unidades/mes):</span>
                        <input
                          type="number"
                          min="1"
                          value={unidadesCapacidad}
                          onChange={e => setUnidadesCapacidad(e.target.value)}
                          className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs font-bold text-slate-700"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">Total fijos: </span>
                        <span className="font-bold text-slate-700">
                          S/ {costosFijosEdit.reduce((t, c) => t + (Number(c.monto_mensual) || 0), 0).toFixed(0)}/mes
                        </span>
                        <span className="ml-3 text-slate-500">Asignado por unidad: </span>
                        <span className="font-black text-slate-800">
                          S/ {(
                            costosFijosEdit.reduce((t, c) => t + (Number(c.monto_mensual) || 0), 0) /
                            Math.max(1, Number(unidadesCapacidad) || 120)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void guardarConfiguracion()}
                      disabled={guardandoConfig}
                      className="w-full rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50"
                    >
                      Guardar configuración de costeo
                    </button>
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
