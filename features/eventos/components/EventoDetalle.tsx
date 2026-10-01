"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GastoForm } from "./GastoForm";
import { FacturaUploader } from "@/features/compras/components/FacturaUploader";
import { agregarGastosDesdeFactura, eliminarGasto, cambiarEstadoEvento } from "../actions/evento-actions";

const CATEGORIA_LABELS: Record<string, string> = {
  insumos: "Insumos",
  mano_obra: "Mano de Obra",
  transporte: "Transporte",
  alquiler: "Alquiler",
  decoracion: "Decoración",
  operativo: "Operativo",
  general: "General",
  otro: "Otro",
};

const CATEGORIA_ICONS: Record<string, string> = {
  insumos: "🥑",
  mano_obra: "👷",
  transporte: "🚗",
  alquiler: "🏗️",
  decoracion: "🎨",
  operativo: "⚡",
  general: "📦",
  otro: "📋",
};

export function EventoDetalle({ evento }: { evento: any }) {
  const router = useRouter();
  const [vistaActiva, setVistaActiva] = useState<"gastos" | "manual" | "ocr" | "informe">("gastos");
  const [ocrEventoId] = useState(evento.id);

  const cobrado = Number(evento.monto_cobrado || 0);
  const totalGastos = Number(evento.total_gastos || 0);
  const gastosTercerizados = Number(evento.gastos_tercerizados || 0);
  const gastosPropios = Number(evento.gastos_propios || 0);
  const ganancia = Number(evento.ganancia || 0);
  const margen = Number(evento.margen || 0);
  const pctTercerizado = totalGastos > 0 ? (gastosTercerizados / totalGastos) * 100 : 0;
  const esPositivo = ganancia >= 0;

  const handleOcrResult = async (data: any) => {
    if (data.items && data.items.length > 0) {
      const items = data.items.map((it: any) => ({
        concepto: it.nombre,
        monto: Number(it.precio_total || 0),
        es_tercerizado: false,
        categoria: "insumos",
      }));
      await agregarGastosDesdeFactura({
        evento_id: ocrEventoId,
        items,
        referencia_factura: data.numero_factura || undefined,
      });
      router.refresh();
      setVistaActiva("gastos");
    }
  };

  const handleEliminarGasto = async (gastoId: string) => {
    await eliminarGasto(gastoId, evento.id);
    router.refresh();
  };

  const handleCambiarEstado = async (estado: string) => {
    await cambiarEstadoEvento(evento.id, estado);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* CABECERA DEL EVENTO */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-gray-900">{evento.nombre}</h2>
          <p className="text-sm text-gray-500">
            {evento.cliente && <span>{evento.cliente} &middot; </span>}
            {evento.fecha_evento || "Sin fecha"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {evento.estado === "activo" && (
            <button onClick={() => handleCambiarEstado("completado")} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm">
              ✓ Marcar Completado
            </button>
          )}
          {evento.estado === "completado" && (
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">✓ Completado</span>
          )}
        </div>
      </div>

      {/* HUD DE RENTABILIDAD EN VIVO */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Cobrado</p>
          <p className="text-2xl font-black text-gray-900 mt-1">S/ {cobrado.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Gastos Totales</p>
          <p className="text-2xl font-black text-red-600 mt-1">S/ {totalGastos.toFixed(2)}</p>
          <div className="flex gap-2 mt-1 text-[10px]">
            <span className="text-gray-500">Propios: S/{gastosPropios.toFixed(0)}</span>
            <span className="text-amber-600">Terc: S/{gastosTercerizados.toFixed(0)}</span>
          </div>
        </div>
        <div className={"bg-white rounded-xl border-2 p-4 shadow-sm " + (esPositivo ? "border-emerald-400" : "border-red-400")}>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Ganancia Neta</p>
          <p className={"text-2xl font-black mt-1 " + (esPositivo ? "text-emerald-600" : "text-red-600")}>
            S/ {ganancia.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Margen</p>
          <p className={"text-2xl font-black mt-1 " + (esPositivo ? "text-emerald-600" : "text-red-600")}>
            {margen.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">% Tercerizado</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pctTercerizado.toFixed(1)}%</p>
        </div>
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
        <button onClick={() => setVistaActiva("gastos")} className={"flex-1 py-2.5 rounded-lg transition-all " + (vistaActiva === "gastos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
          📋 Lista de Gastos ({evento.gastos?.length || 0})
        </button>
        <button onClick={() => setVistaActiva("manual")} className={"flex-1 py-2.5 rounded-lg transition-all " + (vistaActiva === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
          ✏️ Gasto Manual
        </button>
        <button onClick={() => setVistaActiva("ocr")} className={"flex-1 py-2.5 rounded-lg transition-all " + (vistaActiva === "ocr" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500")}>
          📸 Escanear Factura
        </button>
        <button onClick={() => setVistaActiva("informe")} className={"flex-1 py-2.5 rounded-lg transition-all " + (vistaActiva === "informe" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500")}>
          📄 Informe Final
        </button>
      </div>

      {/* CONTENIDO DINÁMICO */}
      {vistaActiva === "gastos" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Concepto</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Tercerizado</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fuente</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!evento.gastos || evento.gastos.length === 0) ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Aún no hay gastos registrados. Usa el formulario manual o escanea una factura.</td></tr>
              ) : (
                evento.gastos.map((g: any) => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{g.concepto}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="mr-1">{CATEGORIA_ICONS[g.categoria] || "📦"}</span>
                      {CATEGORIA_LABELS[g.categoria] || g.categoria}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.es_tercerizado ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">TERCERIZADO</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {g.fuente === "factura_ocr" ? "📸 Factura" : "✏️ Manual"}
                      {g.referencia_factura && <span className="ml-1 text-gray-300">({g.referencia_factura})</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-gray-900">S/ {Number(g.monto).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleEliminarGasto(g.id)} className="text-red-400 hover:text-red-600 text-xs font-bold" title="Eliminar">✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {vistaActiva === "manual" && (
        <GastoForm eventoId={evento.id} onSaved={() => { router.refresh(); setVistaActiva("gastos"); }} />
      )}

      {vistaActiva === "ocr" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
            📸 La IA leerá la factura y los gastos se agregarán automáticamente a este evento. Podrás marcarlos como tercerizados después desde la lista de gastos.
          </div>
          <FacturaUploader onResult={handleOcrResult} />
        </div>
      )}

      {vistaActiva === "informe" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 font-mono text-sm">
          <h3 className="text-center font-black text-lg text-gray-900 font-sans">📄 INFORME DE RENTABILIDAD</h3>
          <div className="border-t border-dashed pt-4 space-y-1">
            <p><strong>Evento:</strong> {evento.nombre}</p>
            <p><strong>Cliente:</strong> {evento.cliente || "—"}</p>
            <p><strong>Fecha:</strong> {evento.fecha_evento || "—"}</p>
          </div>

          <div className="border-t border-dashed pt-4">
            <p className="font-bold text-gray-700 mb-2">INGRESOS</p>
            <div className="flex justify-between">
              <span>Monto cobrado</span>
              <span className="font-bold">S/ {cobrado.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed pt-4">
            <p className="font-bold text-gray-700 mb-2">GASTOS POR CATEGORÍA</p>
            {Object.entries(evento.gastos_por_categoria || {}).map(([cat, monto]) => (
              <div key={cat} className="flex justify-between">
                <span>{CATEGORIA_ICONS[cat] || "📦"} {CATEGORIA_LABELS[cat] || cat}</span>
                <span>S/ {Number(monto).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-300 pt-1 mt-2 font-bold">
              <span>TOTAL GASTOS</span>
              <span className="text-red-600">S/ {totalGastos.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed pt-4">
            <p className="font-bold text-gray-700 mb-2">ANÁLISIS DE TERCERIZACIÓN</p>
            <div className="flex justify-between">
              <span>Gastos propios</span>
              <span>S/ {gastosPropios.toFixed(2)} ({totalGastos > 0 ? ((gastosPropios / totalGastos) * 100).toFixed(1) : 0}%)</span>
            </div>
            <div className="flex justify-between text-amber-700 font-bold">
              <span>Gastos tercerizados</span>
              <span>S/ {gastosTercerizados.toFixed(2)} ({pctTercerizado.toFixed(1)}%)</span>
            </div>
            {evento.gastos?.filter((g: any) => g.es_tercerizado).length > 0 && (
              <div className="mt-2 pl-4 text-xs text-gray-500 space-y-0.5">
                <p className="font-bold text-amber-800">Servicios tercerizados:</p>
                {evento.gastos.filter((g: any) => g.es_tercerizado).map((g: any) => (
                  <div key={g.id} className="flex justify-between">
                    <span>• {g.concepto}</span>
                    <span>S/ {Number(g.monto).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={"border-2 rounded-xl p-4 text-center mt-4 " + (esPositivo ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50")}>
            <p className="text-xs font-bold text-gray-500 uppercase">Resultado Final</p>
            <p className={"text-3xl font-black mt-1 " + (esPositivo ? "text-emerald-600" : "text-red-600")}>
              {esPositivo ? "🟢" : "🔴"} GANANCIA: S/ {ganancia.toFixed(2)}
            </p>
            <p className={"text-sm font-bold mt-1 " + (esPositivo ? "text-emerald-700" : "text-red-700")}>
              Margen: {margen.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
