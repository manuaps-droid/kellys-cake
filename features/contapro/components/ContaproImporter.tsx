"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Loader2,
  BarChart3,
  Database,
} from "lucide-react";

import {
  analizarContaproAction,
  confirmarContaproAction,
  eliminarContaproImportAction,
  listarContaproImportsAction,
  resumenContaproAction,
} from "../actions/contapro.actions";
import type {
  ContaproAnalisis,
  ContaproImportItem,
  ContaproResumenMes,
  ContaproTipo,
} from "../types/contapro.types";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ANIO_ACTUAL = new Date().getFullYear();

const CLASE_INPUT =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

const CLASE_BOTON_PRIMARIO =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50";

const CLASE_BOTON_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-50";

function soles(valor: number): string {
  return `S/ ${valor.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fechaCorta(valor: string): string {
  return new Date(valor).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ContaproImporter() {
  const formRef = useRef<HTMLFormElement>(null);

  const [tipo, setTipo] = useState<ContaproTipo>("compras");
  const [mesDesde, setMesDesde] = useState(ANIO_ACTUAL === new Date().getFullYear() ? new Date().getMonth() + 1 : 1);
  const [anioDesde, setAnioDesde] = useState(ANIO_ACTUAL);
  const [mesHasta, setMesHasta] = useState(new Date().getMonth() + 1);
  const [anioHasta, setAnioHasta] = useState(ANIO_ACTUAL);

  const [analisis, setAnalisis] =
    useState<ContaproAnalisis | null>(null);
  const [resumen, setResumen] = useState<ContaproResumenMes[] | null>(
    null
  );
  const [imports, setImports] = useState<ContaproImportItem[]>([]);
  const [tablaFalta, setTablaFalta] = useState(false);

  const [analizando, setAnalizando] = useState(false);
  const [importando, setImportando] = useState(false);

  const construirFormData = useCallback((): FormData | null => {
    const form = formRef.current;

    if (!form) return null;

    const formData = new FormData(form);

    formData.set("tipo", tipo);
    formData.set("mesDesde", String(mesDesde));
    formData.set("anioDesde", String(anioDesde));
    formData.set("mesHasta", String(mesHasta));
    formData.set("anioHasta", String(anioHasta));

    const archivo = formData.get("archivo");

    if (!(archivo instanceof File) || archivo.size === 0) {
      toast.error("Selecciona el archivo Excel o CSV exportado de Contapro.");
      return null;
    }

    return formData;
  }, [tipo, mesDesde, anioDesde, mesHasta, anioHasta]);

  const cargarHistorial = useCallback(async () => {
    const resultado = await listarContaproImportsAction();
    setImports(resultado.imports);
    setTablaFalta(Boolean(resultado.tablaFalta));
  }, []);

  const cargarResumen = useCallback(async () => {
    const resultado = await resumenContaproAction(
      { mes: mesDesde, anio: anioDesde },
      { mes: mesHasta, anio: anioHasta }
    );
    setResumen(resultado.meses);
    setTablaFalta((prev) => prev || Boolean(resultado.tablaFalta));
  }, [mesDesde, anioDesde, mesHasta, anioHasta]);

  // Carga de datos externos al montar (patrón data-fetch):
  // el estado se actualiza async dentro de las server actions.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarResumen();
  }, [cargarResumen]);

  async function handleAnalizar() {
    const formData = construirFormData();

    if (!formData) return;

    setAnalizando(true);
    setAnalisis(null);

    try {
      const resultado = await analizarContaproAction(formData);
      setAnalisis(resultado);

      if (!resultado.ok) {
        toast.error(resultado.mensaje ?? "No se pudo analizar el archivo.");
      } else {
        toast.success(
          `Archivo leído: ${resultado.filasValidas} movimientos por ${soles(resultado.total)}.`
        );
      }
    } catch {
      toast.error("Error inesperado al analizar el archivo.");
    } finally {
      setAnalizando(false);
    }
  }

  async function handleConfirmar() {
    const formData = construirFormData();

    if (!formData) return;

    setImportando(true);

    try {
      const resultado = await confirmarContaproAction(formData);

      if (!resultado.ok || !resultado.importId) {
        toast.error(resultado.mensaje ?? "No se pudo importar.");
        return;
      }

      toast.success(
        `Importación registrada: ${resultado.filasValidas} movimientos (${soles(resultado.total)}).`
      );

      setAnalisis(null);

      if (formRef.current) {
        formRef.current.reset();
      }

      await Promise.all([cargarHistorial(), cargarResumen()]);
    } catch {
      toast.error("Error inesperado al importar.");
    } finally {
      setImportando(false);
    }
  }

  async function handleEliminar(id: string) {
    const confirmado = window.confirm(
      "¿Eliminar esta importación? Se borrarán todos sus movimientos."
    );

    if (!confirmado) return;

    const resultado = await eliminarContaproImportAction(id);

    if (!resultado.success) {
      toast.error(resultado.mensaje ?? "No se pudo eliminar.");
      return;
    }

    toast.success("Importación eliminada.");
    await Promise.all([cargarHistorial(), cargarResumen()]);
  }

  const totalVentas =
    resumen?.reduce((t, m) => t + m.ventas, 0) ?? 0;
  const totalCompras =
    resumen?.reduce((t, m) => t + m.compras, 0) ?? 0;
  const margenTotal = totalVentas - totalCompras;
  const margenPct =
    totalVentas > 0 ? (margenTotal / totalVentas) * 100 : 0;

  return (
    <div className="space-y-6">
      {tablaFalta && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">Falta aplicar la migración</p>
            <p className="mt-1">
              Las tablas del vínculo contable aún no existen. Ejecuta{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
                npx supabase db push
              </code>{" "}
              en el proyecto para crearlas, y esta pantalla quedará activa.
            </p>
          </div>
        </div>
      )}

      {/* Importador */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Upload className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Importar desde Contapro
            </h2>
            <p className="text-xs text-slate-500">
              Sube el reporte Excel/CSV del sistema contable (compras o
              ventas). Se leen automáticamente la fecha y el total de cada
              documento.
            </p>
          </div>
        </div>

        <form ref={formRef} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Tipo de reporte
              </label>
              <select
                name="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ContaproTipo)}
                className={CLASE_INPUT}
              >
                <option value="compras">Compras (registro de compras)</option>
                <option value="ventas">Ventas (registro de ventas)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Archivo (.xlsx o .csv)
              </label>
              <input
                type="file"
                name="archivo"
                accept=".xlsx,.xls,.csv,.txt"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-emerald-500"
              />
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Desde el mes
              </label>
              <select
                name="mesDesde"
                value={mesDesde}
                onChange={(e) => setMesDesde(Number(e.target.value))}
                className={CLASE_INPUT}
              >
                {MESES.map((nombre, i) => (
                  <option key={nombre} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Año</label>
              <select
                name="anioDesde"
                value={anioDesde}
                onChange={(e) => setAnioDesde(Number(e.target.value))}
                className={CLASE_INPUT}
              >
                {Array.from(
                  { length: 7 },
                  (_, i) => ANIO_ACTUAL - 5 + i
                ).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Hasta el mes
              </label>
              <select
                name="mesHasta"
                value={mesHasta}
                onChange={(e) => setMesHasta(Number(e.target.value))}
                className={CLASE_INPUT}
              >
                {MESES.map((nombre, i) => (
                  <option key={nombre} value={i + 1}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Año</label>
              <select
                name="anioHasta"
                value={anioHasta}
                onChange={(e) => setAnioHasta(Number(e.target.value))}
                className={CLASE_INPUT}
              >
                {Array.from(
                  { length: 7 },
                  (_, i) => ANIO_ACTUAL - 5 + i
                ).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleAnalizar}
              disabled={analizando || importando}
              className={CLASE_BOTON_SECUNDARIO}
            >
              {analizando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Analizar archivo
            </button>

            <button
              type="button"
              onClick={handleConfirmar}
              disabled={
                importando || analizando || !analisis?.ok
              }
              className={CLASE_BOTON_PRIMARIO}
            >
              {importando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Confirmar importación
            </button>
          </div>
        </form>

        {analisis && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            {analisis.ok ? (
              <>
                <p className="text-sm font-bold text-emerald-700">
                  ✅ Archivo legible — {analisis.filasValidas} movimientos
                  dentro del período ({soles(analisis.total)})
                </p>

                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <p>
                    <strong>Fechas detectadas:</strong> {analisis.primerFecha} →{" "}
                    {analisis.ultimaFecha}
                  </p>
                  <p>
                    <strong>Columnas usadas:</strong> fecha «
                    {analisis.columnas.fecha}», total «{analisis.columnas.total}
                    »{analisis.columnas.tercero ? `, tercero «${analisis.columnas.tercero}»` : ""}
                  </p>
                  <p>
                    <strong>Ignoradas fuera del período:</strong>{" "}
                    {analisis.filasFueraPeriodo}
                  </p>
                  <p>
                    <strong>Filas sin total legible:</strong>{" "}
                    {analisis.filasSinTotal}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {analisis.porMes.map((m) => (
                    <span
                      key={`${m.anio}-${m.mes}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs"
                    >
                      {MESES[m.mes - 1]} {m.anio}: {soles(m.total)} ({m.filas})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold text-red-600">
                ⚠️ {analisis.mensaje}
              </p>
            )}
          </div>
        )}
      </div>

      {/* KPIs reales por mes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Rentabilidad real del período
            </h2>
            <p className="text-xs text-slate-500">
              Ventas vs compras importadas del sistema contable
              (ENE {anioDesde} – {MESES[mesHasta - 1]} {anioHasta}).
            </p>
          </div>
        </div>

        {resumen === null ? (
          <p className="text-sm text-slate-400">Cargando…</p>
        ) : resumen.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay datos contables importados en este período. Importa un
            reporte para ver la rentabilidad real por mes.
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-rose-50 p-3">
                <p className="text-[10px] font-bold uppercase text-rose-500">
                  Ventas
                </p>
                <p className="text-lg font-black text-rose-700">
                  {soles(totalVentas)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <p className="text-[10px] font-bold uppercase text-amber-500">
                  Compras
                </p>
                <p className="text-lg font-black text-amber-700">
                  {soles(totalCompras)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-500">
                  Margen
                </p>
                <p className="text-lg font-black text-emerald-700">
                  {soles(margenTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <p className="text-[10px] font-bold uppercase text-blue-500">
                  % Margen
                </p>
                <p className="text-lg font-black text-blue-700">
                  {margenPct.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase text-slate-500">
                    <th className="py-2 pr-4">Mes</th>
                    <th className="py-2 pr-4 text-right">Ventas</th>
                    <th className="py-2 pr-4 text-right">Compras</th>
                    <th className="py-2 pr-4 text-right">Margen</th>
                    <th className="py-2 text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((m) => (
                    <tr
                      key={`${m.anio}-${m.mes}`}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 pr-4 font-semibold text-slate-700">
                        {MESES[m.mes - 1]} {m.anio}
                      </td>
                      <td className="py-2 pr-4 text-right text-rose-600">
                        {soles(m.ventas)}
                      </td>
                      <td className="py-2 pr-4 text-right text-amber-600">
                        {soles(m.compras)}
                      </td>
                      <td className="py-2 pr-4 text-right font-bold text-emerald-600">
                        {soles(m.margen)}
                      </td>
                      <td className="py-2 text-right text-slate-600">
                        {m.margenPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Importaciones realizadas
        </h2>

        {imports.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no has importado archivos de Contapro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase text-slate-500">
                  <th className="py-2 pr-4">Archivo</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Período</th>
                  <th className="py-2 pr-4 text-right">Movimientos</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {imports.map((imp) => (
                  <tr
                    key={imp.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-2 pr-4 font-medium text-slate-700">
                      {imp.archivo_nombre}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          imp.tipo === "ventas"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {imp.tipo}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {fechaCorta(imp.periodo_desde)} →{" "}
                      {fechaCorta(imp.periodo_hasta)}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-700">
                      {imp.filas}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-slate-800">
                      {soles(Number(imp.total))}
                    </td>
                    <td className="py-2 pr-4 text-slate-500">
                      {fechaCorta(imp.creado_en)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleEliminar(imp.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                        aria-label="Eliminar importación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
