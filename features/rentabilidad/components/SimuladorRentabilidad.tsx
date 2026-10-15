"use client";

import { useState, useId, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Save,
  Info,
  Scale,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Target,
  Users,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import {
  CostosFijos,
  CostosVariablesUnitarios,
  ProductoPreset,
} from "../types/rentabilidad.types";
import {
  CATEGORIAS_MARGEN_SUGERIDO,
  COSTOS_FIJOS_DEFAULT,
  COSTOS_VARIABLES_DEFAULT,
  calcularRentabilidad,
} from "../utils/calculadora-rentabilidad";

const STORAGE_KEY_FIJOS = "kellys_foodos_costos_fijos_v1";
const STORAGE_KEY_VARIABLES = "kellys_foodos_costos_variables_v1";
const STORAGE_KEY_MARGEN = "kellys_foodos_margen_v1";

type Props = {
  productosExistentes?: ProductoPreset[];
};

export function SimuladorRentabilidad({ productosExistentes = [] }: Props) {
  // Generar IDs únicos para accesibilidad en inputs de formulario
  const idProductoNombre = useId();
  const idMateriaPrima = useId();
  const idEmpaque = useId();
  const idManoObra = useId();
  const idOtrosVariables = useId();
  const idMargenPersonalizado = useId();
  const idAlquiler = useId();
  const idServicios = useId();
  const idSueldosAdmin = useId();
  const idSoftware = useId();
  const idMarketing = useId();
  const idOtrosFijos = useId();
  const idUnidadesMensuales = useId();
  const idPatrimonio = useId();

  // Estados de entrada de costos
  const [nombreProducto, setNombreProducto] = useState("Torta de Autor Signature (20 porciones)");
  const [costosVariables, setCostosVariables] = useState<CostosVariablesUnitarios>(COSTOS_VARIABLES_DEFAULT);
  const [costosFijos, setCostosFijos] = useState<CostosFijos>(COSTOS_FIJOS_DEFAULT);

  // Estados de margen
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState<string>("tortas-autor");
  const [usarMargenPersonalizado, setUsarMargenPersonalizado] = useState<boolean>(false);
  const [margenPersonalizadoValor, setMargenPersonalizadoValor] = useState<number>(75);

  // Estados de proyección
  const [unidadesMensuales, setUnidadesMensuales] = useState<number>(45);
  const [patrimonioInvertido, setPatrimonioInvertido] = useState<number>(20000);

  // Cargar preferencias guardadas en localStorage si existen
  useEffect(() => {
    try {
      const savedFijos = localStorage.getItem(STORAGE_KEY_FIJOS);
      if (savedFijos) setCostosFijos(JSON.parse(savedFijos));

      const savedVariables = localStorage.getItem(STORAGE_KEY_VARIABLES);
      if (savedVariables) setCostosVariables(JSON.parse(savedVariables));

      const savedMargen = localStorage.getItem(STORAGE_KEY_MARGEN);
      if (savedMargen) {
        const parsed = JSON.parse(savedMargen);
        if (parsed.usarPersonalizado !== undefined) setUsarMargenPersonalizado(parsed.usarPersonalizado);
        if (parsed.valor !== undefined) setMargenPersonalizadoValor(parsed.valor);
        if (parsed.categoriaId) setCategoriaSeleccionadaId(parsed.categoriaId);
      }
    } catch {
      // Ignorar errores de localStorage en entornos restringidos
    }
  }, []);

  // Determinar margen activo
  const categoriaActiva = useMemo(() => {
    return (
      CATEGORIAS_MARGEN_SUGERIDO.find((c) => c.id === categoriaSeleccionadaId) ||
      CATEGORIAS_MARGEN_SUGERIDO[0]
    );
  }, [categoriaSeleccionadaId]);

  const margenActivo = usarMargenPersonalizado
    ? margenPersonalizadoValor
    : categoriaActiva.margenSugerido;

  // Cálculo reactivo central
  const resultado = useMemo(() => {
    return calcularRentabilidad(
      costosVariables,
      costosFijos,
      margenActivo,
      usarMargenPersonalizado,
      unidadesMensuales,
      patrimonioInvertido
    );
  }, [
    costosVariables,
    costosFijos,
    margenActivo,
    usarMargenPersonalizado,
    unidadesMensuales,
    patrimonioInvertido,
  ]);

  // Manejar selección de producto del catálogo FoodOS
  const handleSelectProductoExistente = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) return;

    const prod = productosExistentes.find((p) => p.id === id);
    if (!prod) return;

    setNombreProducto(prod.nombre);
    if (prod.precio_costo && prod.precio_costo > 0) {
      setCostosVariables((prev) => ({
        ...prev,
        materiaPrima: prod.precio_costo ?? prev.materiaPrima,
      }));
    }

    if (prod.margen_porcentaje && prod.margen_porcentaje > 0) {
      setUsarMargenPersonalizado(true);
      setMargenPersonalizadoValor(Math.round(prod.margen_porcentaje));
    }

    toast.success(`Cargada receta de "${prod.nombre}" con costo de insumos S/ ${(prod.precio_costo || 0).toFixed(2)}`);
  };

  // Guardar configuración en localStorage
  const handleGuardarConfiguracion = () => {
    try {
      localStorage.setItem(STORAGE_KEY_FIJOS, JSON.stringify(costosFijos));
      localStorage.setItem(STORAGE_KEY_VARIABLES, JSON.stringify(costosVariables));
      localStorage.setItem(
        STORAGE_KEY_MARGEN,
        JSON.stringify({
          usarPersonalizado: usarMargenPersonalizado,
          valor: margenPersonalizadoValor,
          categoriaId: categoriaSeleccionadaId,
        })
      );
      toast.success("Estructura de costos guardada correctamente en este navegador.");
    } catch {
      toast.error("No se pudo guardar la configuración.");
    }
  };

  // Restablecer a los valores por defecto de Kelly's Cake
  const handleRestablecerValores = () => {
    setCostosVariables(COSTOS_VARIABLES_DEFAULT);
    setCostosFijos(COSTOS_FIJOS_DEFAULT);
    setCategoriaSeleccionadaId("tortas-autor");
    setUsarMargenPersonalizado(false);
    setMargenPersonalizadoValor(75);
    setUnidadesMensuales(45);
    setPatrimonioInvertido(20000);
    setNombreProducto("Torta de Autor Signature (20 porciones)");
    toast.info("Valores estándar de Kelly's Cake restablecidos.");
  };

  // Copiar resumen ejecutivo para compartir o cotizar
  const handleCopiarResumen = () => {
    const resumen = `📊 DIAGNÓSTICO FINANCIERO & RENTABILIDAD - KELLY'S CAKE
--------------------------------------------------
Producto: ${nombreProducto}
Costo Variable Total: S/ ${resultado.costoVariableTotal.toFixed(2)}
  • Materia Prima: S/ ${costosVariables.materiaPrima.toFixed(2)} (${resultado.foodCostPorcentaje.toFixed(1)}% Food Cost)
  • Empaque: S/ ${costosVariables.empaque.toFixed(2)}
  • Mano de Obra: S/ ${costosVariables.manoObraDirecta.toFixed(2)} (${resultado.laborCostPorcentaje.toFixed(1)}% Labor Cost)
  • Otros/Comisión: S/ ${costosVariables.otrosVariables.toFixed(2)}

Margen de Ganancia: ${resultado.margenPorcentajeAplicado}% (${resultado.esMargenPersonalizado ? "Personalizado" : categoriaActiva.nombre})
PRECIO DE VENTA SUGERIDO: S/ ${resultado.precioVentaSugerido.toFixed(2)}
Ganancia Bruta por Unidad: S/ ${resultado.gananciaBrutaUnitaria.toFixed(2)}

PUNTO DE EQUILIBRIO MENSUAL:
  • Costos Fijos Mensuales: S/ ${resultado.costosFijosTotales.toFixed(2)}
  • Mínimo a Facturar: S/ ${resultado.puntoEquilibrioSoles.toFixed(2)}
  • Unidades Requeridas: ${resultado.puntoEquilibrioUnidades} pasteles/mes (${resultado.unidadesDiariasPuntoEquilibrio}/día)

PROYECCIÓN CON ${unidadesMensuales} PEDIDOS AL MES:
  • Facturación Mensual: S/ ${resultado.ventasTotalesProyectadas.toFixed(2)}
  • Utilidad Neta Mensual: S/ ${resultado.utilidadNetaMensual.toFixed(2)}
  • ROS (Rentabilidad sobre Ventas): ${resultado.ros.toFixed(1)}%
  • ROE Anualizado: ${resultado.roe.toFixed(1)}%
  • ROI Anual: ${resultado.roi.toFixed(1)}%

INDICADORES COMERCIALES:
  • Ticket Promedio: S/ ${resultado.ticketPromedio.toFixed(2)}
  • CAC Máximo Sugerido (Pauta): S/ ${resultado.cacMaximoRecomendado.toFixed(2)}
  • LTV Objetivo Anual: S/ ${resultado.ltvObjetivo.toFixed(2)}`;

    navigator.clipboard.writeText(resumen);
    toast.success("¡Resumen ejecutivo copiado al portapapeles!");
  };

  return (
    <div className="space-y-8">
      {/* 1. Header con Resumen & Acciones */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>FoodOS Financial Intelligence Suite</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Simulador de Rentabilidad & Diagnóstico Financiero
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Calcula con precisión matemática el precio óptimo, tu punto de equilibrio y audita los techos de Food Cost, Mano de Obra, ROS, ROE y ROI de tu pastelería.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopiarResumen}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 shadow-sm"
              title="Copiar diagnóstico para informe o WhatsApp"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>Copiar Resumen</span>
            </button>
            <button
              onClick={handleGuardarConfiguracion}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              title="Guardar mis costos en este navegador"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Costos</span>
            </button>
            <button
              onClick={handleRestablecerValores}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition border border-slate-700/60"
              title="Restablecer valores por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra superior de métricas ultra-rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Margen Aplicado</span>
            <div className="text-xl font-bold text-blue-400 mt-0.5">
              {resultado.margenPorcentajeAplicado}%
              <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                {resultado.esMargenPersonalizado ? "(Manual)" : "(Sugerido)"}
              </span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Precio Venta</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              S/ {resultado.precioVentaSugerido.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Pto. Equilibrio</span>
            <div className="text-xl font-bold text-amber-300 mt-0.5">
              {resultado.puntoEquilibrioUnidades} <span className="text-xs font-normal text-slate-400">pasteles/mes</span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">ROS Proyectado</span>
            <div className={`text-xl font-bold mt-0.5 ${resultado.ros >= 15 ? "text-emerald-400" : resultado.ros > 0 ? "text-amber-400" : "text-rose-400"}`}>
              {resultado.ros.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Principal: 2 Columnas (Inputs de Costo vs Diagnóstico Financiero) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: ENTRADA DE TODOS LOS COSTOS (7 COLS)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* TARJETA 0: PRECARGAR PRODUCTO O DEFINIR NOMBRE */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <label htmlFor={idProductoNombre} className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Producto a Simular</span>
              </label>

              {productosExistentes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Cargar de Recetas:</span>
                  <select
                    onChange={handleSelectProductoExistente}
                    defaultValue=""
                    className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="" disabled>Seleccionar producto...</option>
                    {productosExistentes.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre} (Costo: S/ {(prod.precio_costo || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <input
              id={idProductoNombre}
              type="text"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              placeholder="Ej: Torta de Chocolate Húmeda 20p..."
              className="w-full text-base font-semibold text-gray-900 bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* TARJETA 1: COSTOS VARIABLES UNITARIOS */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Costos Variables Unitarios</span>
                </h2>
                <p className="text-xs text-gray-500">Gastos que se consumen directamente por cada pastel elaborado.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Total Variable</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  S/ {resultado.costoVariableTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Materia Prima */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={idMateriaPrima} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>🥑 Insumos / Materia Prima</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Receta</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idMateriaPrima}
                    type="number"
                    step="0.5"
                    min="0"
                    value={costosVariables.materiaPrima}
                    onChange={(e) =>
                      setCostosVariables({
                        ...costosVariables,
                        materiaPrima: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Harina, huevos, mantequilla, chocolate, manjar, frutas.</p>
              </div>

              {/* Empaque & Packaging */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={idEmpaque} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>🎁 Empaque & Presentación</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Packaging</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idEmpaque}
                    type="number"
                    step="0.5"
                    min="0"
                    value={costosVariables.empaque}
                    onChange={(e) =>
                      setCostosVariables({
                        ...costosVariables,
                        empaque: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Caja con visor, base rígida, lazo satinado, sticker Kelly&apos;s.</p>
              </div>

              {/* Mano de Obra Directa */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={idManoObra} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>👨‍🍳 Mano de Obra Directa</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Producción</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idManoObra}
                    type="number"
                    step="0.5"
                    min="0"
                    value={costosVariables.manoObraDirecta}
                    onChange={(e) =>
                      setCostosVariables({
                        ...costosVariables,
                        manoObraDirecta: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Horas de decoración y horneado asignadas a este pastel.</p>
              </div>

              {/* Otros Variables / Comisión */}
              <div className="bg-gray-50/60 p-3.5 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor={idOtrosVariables} className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>💳 Pasarela / Gas / Varios</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Indirecto U.</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idOtrosVariables}
                    type="number"
                    step="0.5"
                    min="0"
                    value={costosVariables.otrosVariables}
                    onChange={(e) =>
                      setCostosVariables({
                        ...costosVariables,
                        otrosVariables: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Comisión tarjeta/pasarela (3.5%), gas por horneada, guantes.</p>
              </div>
            </div>
          </div>

          {/* TARJETA 2: SELECTOR DE MARGEN (SUGERIDO VS ALTERNATIVA PERSONALIZADA) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <span>Configuración del Margen de Ganancia</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Elige el margen sugerido de la industria o escribe tu margen alternativo deseado.
                </p>
              </div>

              {/* Botón de Alternancia (Switch) */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUsarMargenPersonalizado(false)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    !usarMargenPersonalizado
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Márgenes Sugeridos
                </button>
                <button
                  type="button"
                  onClick={() => setUsarMargenPersonalizado(true)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    usarMargenPersonalizado
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Mi Margen Propio
                </button>
              </div>
            </div>

            {/* OPCIÓN A: MARGEN SUGERIDO POR CATEGORÍA */}
            {!usarMargenPersonalizado ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-600 block uppercase tracking-wider">
                  Márgenes Recomendados por Tipo de Pastelería
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIAS_MARGEN_SUGERIDO.map((cat) => {
                    const isSelected = categoriaSeleccionadaId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoriaSeleccionadaId(cat.id)}
                        className={`text-left p-3.5 rounded-xl border transition relative flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{cat.nombre}</span>
                            <span className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-tight">
                              {cat.descripcion}
                            </span>
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                          }`}>
                            {cat.margenSugerido}%
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
                          <span>Rango: {cat.rangoMin}% - {cat.rangoMax}%</span>
                          <span className="font-medium text-blue-600">{cat.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* OPCIÓN B: MARGEN PERSONALIZADO ALTERNATIVO */
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor={idMargenPersonalizado} className="text-xs font-bold text-blue-950 block">
                      Ingresa tu Margen Deseado como Alternativa
                    </label>
                    <p className="text-[11px] text-blue-800">
                      Tú defines el porcentaje que deseas ganar sobre el precio final de venta.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-blue-300 shadow-xs">
                    <input
                      id={idMargenPersonalizado}
                      type="number"
                      min="5"
                      max="95"
                      value={margenPersonalizadoValor}
                      onChange={(e) => setMargenPersonalizadoValor(parseFloat(e.target.value) || 0)}
                      className="w-14 text-center font-extrabold text-blue-600 text-lg focus:outline-none"
                    />
                    <span className="text-sm font-black text-blue-600">%</span>
                  </div>
                </div>

                {/* Slider interactivo */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={margenPersonalizadoValor}
                    aria-label="Margen deseado"
                    onChange={(e) => setMargenPersonalizadoValor(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-blue-700 font-medium">
                    <span>30% (Margen mínimo)</span>
                    <span>50% (Equilibrado)</span>
                    <span>70% (Boutique)</span>
                    <span>90% (Alta Joyería)</span>
                  </div>
                </div>

                {/* Botones rápidos de margen personalizado */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[50, 60, 65, 70, 75, 80, 85].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMargenPersonalizadoValor(pct)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                        margenPersonalizadoValor === pct
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-blue-900 border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TARJETA 3: COSTOS FIJOS MENSUALES DEL NEGOCIO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <span>Costos Fijos Mensuales del Negocio</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Gastos estructurales que se pagan cada mes aunque no se venda ni un solo pastel.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Total Fijo Mensual</span>
                <span className="text-lg font-extrabold text-indigo-600">
                  S/ {resultado.costosFijosTotales.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Alquiler */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idAlquiler} className="text-xs font-semibold text-gray-700 block">
                  🏢 Alquiler Local/Taller
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idAlquiler}
                    type="number"
                    step="50"
                    min="0"
                    value={costosFijos.alquiler}
                    onChange={(e) =>
                      setCostosFijos({ ...costosFijos, alquiler: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Servicios (Luz, agua, gas) */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idServicios} className="text-xs font-semibold text-gray-700 block">
                  ⚡ Servicios (Luz/Agua/Gas)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idServicios}
                    type="number"
                    step="20"
                    min="0"
                    value={costosFijos.servicios}
                    onChange={(e) =>
                      setCostosFijos({ ...costosFijos, servicios: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sueldos Fijos / Admin */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idSueldosAdmin} className="text-xs font-semibold text-gray-700 block">
                  👔 Sueldos Fijos / Admin
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idSueldosAdmin}
                    type="number"
                    step="50"
                    min="0"
                    value={costosFijos.sueldosAdministrativos}
                    onChange={(e) =>
                      setCostosFijos({
                        ...costosFijos,
                        sueldosAdministrativos: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Software, Dominio & Web */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idSoftware} className="text-xs font-semibold text-gray-700 block">
                  💻 Software & Web FoodOS
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idSoftware}
                    type="number"
                    step="10"
                    min="0"
                    value={costosFijos.softwareInternet}
                    onChange={(e) =>
                      setCostosFijos({
                        ...costosFijos,
                        softwareInternet: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Marketing & Publicidad */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idMarketing} className="text-xs font-semibold text-gray-700 block">
                  📢 Pauta Meta & Google Ads
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idMarketing}
                    type="number"
                    step="50"
                    min="0"
                    value={costosFijos.marketingPublicidad}
                    onChange={(e) =>
                      setCostosFijos({
                        ...costosFijos,
                        marketingPublicidad: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Otros Gastos Fijos */}
              <div className="bg-gray-50/60 p-3 rounded-xl border border-gray-100 space-y-1">
                <label htmlFor={idOtrosFijos} className="text-xs font-semibold text-gray-700 block">
                  🛡️ Contador & Depreciación
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idOtrosFijos}
                    type="number"
                    step="20"
                    min="0"
                    value={costosFijos.otrosFijos}
                    onChange={(e) =>
                      setCostosFijos({ ...costosFijos, otrosFijos: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-2 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TARJETA 4: ESCENARIO DE VENTAS MENSUALES & PATRIMONIO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span>Escenario de Producción Mensual & Capital Invertido</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={idUnidadesMensuales} className="text-xs font-bold text-purple-950">
                    Ventas Mensuales Estimadas
                  </label>
                  <span className="text-xs font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                    {unidadesMensuales} pedidos
                  </span>
                </div>
                <input
                  id={idUnidadesMensuales}
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={unidadesMensuales}
                  onChange={(e) => setUnidadesMensuales(parseInt(e.target.value) || 1)}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-200 rounded-lg"
                />
                <p className="text-[11px] text-purple-800">
                  Volumen promedio de pasteles o pedidos elaborados en el mes para proyectar utilidades.
                </p>
              </div>

              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={idPatrimonio} className="text-xs font-bold text-gray-800">
                    Capital / Maquinaria Invertida
                  </label>
                  <span className="text-xs font-semibold text-gray-500">Para ROE</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-400 font-bold">S/</span>
                  <input
                    id={idPatrimonio}
                    type="number"
                    step="1000"
                    min="1000"
                    value={patrimonioInvertido}
                    onChange={(e) => setPatrimonioInvertido(parseFloat(e.target.value) || 1000)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Inversión en hornos, batidoras, mobiliario y capital de trabajo inicial.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: RESULTADOS, SEMÁFOROS Y DIAGNÓSTICO (5 C)*/}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">

          {/* 1. TARJETA MAESTRA: PRECIO DE VENTA Y GANANCIA */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-900/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Precio de Venta Recomendado</span>
              </span>
              <span className="text-[11px] bg-blue-600/30 text-blue-200 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-bold">
                {resultado.margenPorcentajeAplicado}% Margen
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                S/ {resultado.precioVentaSugerido.toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 font-medium">/ unidad</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Ganancia Bruta</span>
                <span className="text-lg font-bold text-emerald-400">
                  + S/ {resultado.gananciaBrutaUnitaria.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Costo Total Var.</span>
                <span className="text-lg font-bold text-slate-300">
                  S/ {resultado.costoVariableTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. AUDITORÍA DE TECHOS GASTRONÓMICOS (FOOD COST & LABOR COST) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Auditoría de Techos de Costo</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">Estándar Pastelería</span>
            </div>

            {/* FOOD COST */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Food Cost (Materia Prima)</span>
                <span className={`font-black ${
                  resultado.diagnosticoFoodCost.estado === "optimo"
                    ? "text-emerald-600"
                    : resultado.diagnosticoFoodCost.estado === "alerta"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}>
                  {resultado.foodCostPorcentaje.toFixed(1)}% (Meta: ≤ 30%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    resultado.diagnosticoFoodCost.estado === "optimo"
                      ? "bg-emerald-500"
                      : resultado.diagnosticoFoodCost.estado === "alerta"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, resultado.foodCostPorcentaje * 2.5)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                {resultado.diagnosticoFoodCost.mensaje}
              </p>
            </div>

            {/* LABOR COST */}
            <div className="space-y-1.5 pt-2 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Labor Cost (Mano de Obra Directa)</span>
                <span className={`font-black ${
                  resultado.diagnosticoLaborCost.estado === "optimo"
                    ? "text-emerald-600"
                    : resultado.diagnosticoLaborCost.estado === "alerta"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}>
                  {resultado.laborCostPorcentaje.toFixed(1)}% (Meta: ≤ 25%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    resultado.diagnosticoLaborCost.estado === "optimo"
                      ? "bg-emerald-500"
                      : resultado.diagnosticoLaborCost.estado === "alerta"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, resultado.laborCostPorcentaje * 3)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                {resultado.diagnosticoLaborCost.mensaje}
              </p>
            </div>

            {/* PRIME COST */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Prime Cost Total</span>
                <span className="text-[10px] text-slate-500">Materia Prima + Personal Directo</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${
                  resultado.diagnosticoPrimeCost.estado === "optimo"
                    ? "text-emerald-600"
                    : resultado.diagnosticoPrimeCost.estado === "alerta"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}>
                  {resultado.primeCostPorcentaje.toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-400 block">Meta ≤ 55%</span>
              </div>
            </div>
          </div>

          {/* 3. PUNTO DE EQUILIBRIO (BREAK-EVEN POINT) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />
                <span>Punto de Equilibrio Mensual</span>
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                Cero Pérdidas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-900 font-semibold block">Facturación Mínima</span>
                <span className="text-base font-extrabold text-amber-950 mt-0.5 block">
                  S/ {resultado.puntoEquilibrioSoles.toFixed(2)}
                </span>
                <span className="text-[10px] text-amber-700">Para cubrir fijos de S/ {resultado.costosFijosTotales.toFixed(0)}</span>
              </div>

              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-900 font-semibold block">Pedidos Requeridos</span>
                <span className="text-base font-extrabold text-amber-950 mt-0.5 block">
                  {resultado.puntoEquilibrioUnidades} pasteles
                </span>
                <span className="text-[10px] text-amber-700">o {resultado.unidadesDiariasPuntoEquilibrio} por día</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
              💡 Con <strong className="text-gray-900">{unidadesMensuales} pedidos</strong> mensuales simulados, estás{" "}
              {unidadesMensuales >= resultado.puntoEquilibrioUnidades ? (
                <span className="text-emerald-700 font-bold">
                  {unidadesMensuales - resultado.puntoEquilibrioUnidades} pedidos por encima del punto de equilibrio (colchón de ganancia neta).
                </span>
              ) : (
                <span className="text-rose-700 font-bold">
                  {resultado.puntoEquilibrioUnidades - unidadesMensuales} pedidos por debajo del punto de equilibrio (en riesgo de pérdida).
                </span>
              )}
            </div>
          </div>

          {/* 4. RATIOS FINANCIEROS CLAVE: ROS, ROE, ROI */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Ratios de Rentabilidad (ROS, ROE, ROI)</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">Con {unidadesMensuales} ped./mes</span>
            </div>

            <div className="space-y-2.5">
              {/* ROS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">ROS (Return on Sales)</span>
                    <span className="text-[10px] text-gray-400 font-medium">Margen Neto</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Utilidad Neta / Facturación</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-extrabold ${
                    resultado.diagnosticoROS.estado === "optimo"
                      ? "text-emerald-600"
                      : resultado.diagnosticoROS.estado === "alerta"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}>
                    {resultado.ros.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-gray-400 block">Objetivo ≥ 20%</span>
                </div>
              </div>

              {/* ROE */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">ROE (Return on Equity)</span>
                    <span className="text-[10px] text-gray-400 font-medium">Retorno Capital</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Utilidad Anual / Patrimonio (S/ {resultado.patrimonioInvertido})</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-extrabold ${
                    resultado.diagnosticoROE.estado === "optimo"
                      ? "text-emerald-600"
                      : resultado.diagnosticoROE.estado === "alerta"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}>
                    {resultado.roe.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-gray-400 block">Objetivo ≥ 30%</span>
                </div>
              </div>

              {/* ROI */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">ROI (Return on Investment)</span>
                    <span className="text-[10px] text-gray-400 font-medium">Inversión Operativa</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Retorno sobre Costos Anuales</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-extrabold ${
                    resultado.diagnosticoROI.estado === "optimo"
                      ? "text-emerald-600"
                      : resultado.diagnosticoROI.estado === "alerta"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}>
                    {resultado.roi.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-gray-400 block">Objetivo ≥ 25%</span>
                </div>
              </div>
            </div>

            {/* ESTADO DE RESULTADOS RESUMIDO */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Ventas Totales Proyectadas:</span>
                <span className="font-semibold text-white">S/ {resultado.ventasTotalesProyectadas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Costos Variables ({unidadesMensuales} u):</span>
                <span>- S/ {resultado.costosVariablesTotales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-semibold border-t border-slate-800 pt-1">
                <span>(=) Utilidad Bruta:</span>
                <span>S/ {resultado.utilidadBrutaMensual.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Costos Fijos del Negocio:</span>
                <span>- S/ {resultado.costosFijosTotales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-extrabold text-sm border-t border-slate-700 pt-1.5">
                <span>(=) Utilidad Neta Mensual:</span>
                <span>S/ {resultado.utilidadNetaMensual.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 5. INDICADORES COMERCIALES (CAC, LTV, TICKET) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Indicadores Comerciales Kelly&apos;s Cake</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-indigo-900 font-bold block">CAC Máximo Sugerido</span>
                <span className="text-base font-extrabold text-indigo-950 mt-0.5 block">
                  S/ {resultado.cacMaximoRecomendado.toFixed(2)}
                </span>
                <span className="text-[10px] text-indigo-700">Límite por cliente en Meta Ads</span>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-indigo-900 font-bold block">LTV Estimado (12m)</span>
                <span className="text-base font-extrabold text-indigo-950 mt-0.5 block">
                  S/ {resultado.ltvObjetivo.toFixed(2)}
                </span>
                <span className="text-[10px] text-indigo-700">Base 3.2 recompras anuales</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
