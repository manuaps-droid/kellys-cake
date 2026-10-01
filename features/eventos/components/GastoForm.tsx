"use client";

import { useState } from "react";
import { agregarGasto } from "../actions/evento-actions";

const CATEGORIAS = [
  { value: "insumos", label: "Insumos / Materia Prima" },
  { value: "mano_obra", label: "Mano de Obra" },
  { value: "transporte", label: "Transporte / Delivery" },
  { value: "alquiler", label: "Alquiler de Equipos" },
  { value: "decoracion", label: "Decoración" },
  { value: "operativo", label: "Gastos Operativos" },
  { value: "otro", label: "Otro" },
];

export function GastoForm({ eventoId, onSaved }: { eventoId: string; onSaved?: () => void }) {
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [esTercerizado, setEsTercerizado] = useState(false);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!concepto.trim()) { setError("Ingresa un concepto para el gasto."); return; }
    if (!monto || Number(monto) <= 0) { setError("El monto debe ser mayor a 0."); return; }

    setLoading(true);
    setError(null);

    const res = await agregarGasto({
      evento_id: eventoId,
      concepto: concepto.trim(),
      monto: Number(monto),
      categoria,
      es_tercerizado: esTercerizado,
      fuente: "manual",
      notas: notas || undefined,
    });

    if (res.error) {
      setError(res.error);
    } else {
      setConcepto("");
      setMonto("");
      setCategoria("general");
      setEsTercerizado(false);
      setNotas("");
      onSaved?.();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        ✏️ Agregar Gasto Manual
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Concepto / Descripción</label>
          <input
            type="text"
            placeholder="Ej: Transporte al local del evento"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto (S/)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white"
            >
              <option value="general">General</option>
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CHECKBOX TERCERIZADO */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <input
          type="checkbox"
          id="tercerizado"
          checked={esTercerizado}
          onChange={(e) => setEsTercerizado(e.target.checked)}
          className="w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
        />
        <label htmlFor="tercerizado" className="cursor-pointer">
          <span className="text-sm font-bold text-amber-900">¿Es un servicio tercerizado?</span>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Marca esta casilla si el gasto fue pagado a un proveedor externo (alquiler, transporte, ayudante, decoración externa, etc.)
          </p>
        </label>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium">⚠️ {error}</div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
      >
        {loading ? "Guardando..." : "+ Registrar Gasto"}
      </button>
    </div>
  );
}
