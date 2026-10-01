"use client";

import { useState } from "react";
import { toggleModulo } from "../actions/modulo-actions";

export function ModulosManager({ modulosActivos }: { modulosActivos: string[] }) {
  const [activos, setActivos] = useState<string[]>(modulosActivos);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (modulo: string) => {
    if (modulo === "core") return;
    const nuevoEstado = !activos.includes(modulo);
    setLoading(modulo);

    const res = await toggleModulo(modulo, nuevoEstado);
    if (res?.success) {
      if (nuevoEstado) {
        setActivos(prev => [...prev, modulo]);
      } else {
        setActivos(prev => prev.filter(m => m !== modulo));
      }
    }
    setLoading(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* MODULO 1: CORE */}
      <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">
          Siempre Activo
        </div>
        <div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-bold">
            🟢
          </div>
          <h3 className="text-lg font-black text-gray-900">Módulo 1: FoodOS Core</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
            El motor matemático fundamental para cualquier negocio gastronómico.
          </p>
          <ul className="space-y-2 text-xs text-gray-600 border-t pt-4">
            <li className="flex items-center gap-2">✓ Catálogo de Insumos & Recetas</li>
            <li className="flex items-center gap-2">✓ Calculadora de Costos en Vivo</li>
            <li className="flex items-center gap-2">✓ Escáner OCR de Facturas (IA)</li>
            <li className="flex items-center gap-2">✓ Registro de Compras (Cascada)</li>
            <li className="flex items-center gap-2">✓ Asistente AI Copilot</li>
          </ul>
        </div>
        <div className="mt-6 pt-4 border-t">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
            Incluido en Plan Base
          </span>
        </div>
      </div>

      {/* MODULO 2: LOGÍSTICA & ALMACENES */}
      <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm flex flex-col justify-between transition-all ${activos.includes("logistica") ? "border-amber-500 shadow-amber-50" : "border-gray-200 opacity-85"}`}>
        <div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4 font-bold">
            🟡
          </div>
          <h3 className="text-lg font-black text-gray-900">Módulo 2: Logística & Stock</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
            Control de almacenes físicos, conteos de existencias y trazabilidad de Kardex.
          </p>
          <ul className="space-y-2 text-xs text-gray-600 border-t pt-4">
            <li className="flex items-center gap-2">✓ Múltiples Almacenes Físicos</li>
            <li className="flex items-center gap-2">✓ Stock en Tiempo Real</li>
            <li className="flex items-center gap-2">✓ Entrada de Stock directa por Factura</li>
            <li className="flex items-center gap-2">✓ Kardex Auditable de Movimientos</li>
            <li className="flex items-center gap-2">✓ Alertas de Stock Mínimo</li>
            <li className="flex items-center gap-2">✓ Hojas de Producción (BOM)</li>
          </ul>
        </div>
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">Estado del Módulo:</span>
          <button
            onClick={() => handleToggle("logistica")}
            disabled={loading === "logistica"}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${activos.includes("logistica") ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {loading === "logistica" ? "Guardando..." : (activos.includes("logistica") ? "✓ Activo" : "+ Activar Módulo")}
          </button>
        </div>
      </div>

      {/* MODULO 3: VENTAS & FACTURACIÓN SUNAT */}
      <div className={`bg-white rounded-2xl border-2 p-6 shadow-sm flex flex-col justify-between transition-all ${activos.includes("ventas") ? "border-rose-500 shadow-rose-50" : "border-gray-200 opacity-85"}`}>
        <div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-4 font-bold">
            🔴
          </div>
          <h3 className="text-lg font-black text-gray-900">Módulo 3: Ventas & Facturación</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
            Punto de Venta (POS) rápido con emisión de Boletas y Facturas electrónicas SUNAT.
          </p>
          <ul className="space-y-2 text-xs text-gray-600 border-t pt-4">
            <li className="flex items-center gap-2">✓ Punto de Venta (POS) de mostrador</li>
            <li className="flex items-center gap-2">✓ Boletas y Facturas SUNAT (Nubefact)</li>
            <li className="flex items-center gap-2">✓ Generación de PDF y Código QR oficial</li>
            <li className="flex items-center gap-2">✓ Cotizador de Eventos y Catering</li>
            <li className="flex items-center gap-2">✓ Descuento Automático de Stock al vender</li>
            <li className="flex items-center gap-2">✓ Reportes de Ventas y Cierre de Caja</li>
          </ul>
        </div>
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">Estado del Módulo:</span>
          <button
            onClick={() => handleToggle("ventas")}
            disabled={loading === "ventas"}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${activos.includes("ventas") ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            {loading === "ventas" ? "Guardando..." : (activos.includes("ventas") ? "✓ Activo" : "+ Activar Módulo")}
          </button>
        </div>
      </div>
    </div>
  );
}
