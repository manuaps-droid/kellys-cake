"use client";

import { useState } from "react";
import { actualizarIngrediente, eliminarIngrediente } from "../actions/ingrediente-actions";

type Ingrediente = {
  id: string;
  nombre: string;
  unidad_compra: string;
  unidad_uso: string;
  factor_conversion: number;
  costo_unitario: number;
  costo_por_unidad_uso?: number;
  porcentaje_merma_estandar: number;
  porcentaje_rendimiento?: number;
};

export function IngredientesClientTable({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [editingIng, setEditingIng] = useState<Ingrediente | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtrados = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEditClick = (ing: Ingrediente) => {
    setEditingIng({ ...ing });
    setErrorMsg(null);
  };

  const handleCloseModal = () => {
    setEditingIng(null);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIng) return;

    if (!editingIng.nombre.trim()) {
      setErrorMsg("El nombre no puede estar vacío.");
      return;
    }

    if (Number(editingIng.costo_unitario) < 0) {
      setErrorMsg("El costo no puede ser negativo.");
      return;
    }

    if (Number(editingIng.factor_conversion) <= 0) {
      setErrorMsg("El factor de conversión debe ser mayor a 0.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const res = await actualizarIngrediente(editingIng.id, {
      nombre: editingIng.nombre.trim(),
      unidad_compra: editingIng.unidad_compra,
      unidad_uso: editingIng.unidad_uso,
      factor_conversion: Number(editingIng.factor_conversion),
      costo_unitario: Number(editingIng.costo_unitario),
      porcentaje_merma_estandar: Number(editingIng.porcentaje_merma_estandar || 0),
      porcentaje_rendimiento: Number(editingIng.porcentaje_rendimiento || 100),
    });

    if (res.error) {
      setErrorMsg(res.error);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      setEditingIng(null);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el ingrediente "${nombre}"?`)) return;

    setDeletingId(id);
    const res = await eliminarIngrediente(id);
    if (res?.error) {
      alert("⚠️ " + res.error);
    }
    setDeletingId(null);
  };

  // Cálculo en vivo para el modal
  const costoUsoCalculado =
    editingIng && editingIng.factor_conversion > 0
      ? (Number(editingIng.costo_unitario) / Number(editingIng.factor_conversion)).toFixed(4)
      : "0.0000";

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="🔍 Buscar insumo por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total: {filtrados.length} ingredientes
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Insumo / Nombre
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Costo Compra
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Costo por Unidad de Uso
              </th>
              <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Merma (%)
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  {busqueda
                    ? "No se encontraron ingredientes con ese nombre."
                    : "No tienes ingredientes registrados aún."}
                </td>
              </tr>
            ) : (
              filtrados.map((ing) => {
                const costoUso =
                  ing.costo_por_unidad_uso != null
                    ? Number(ing.costo_por_unidad_uso)
                    : ing.factor_conversion > 0
                    ? ing.costo_unitario / ing.factor_conversion
                    : 0;

                return (
                  <tr key={ing.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {ing.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      S/ {Number(ing.costo_unitario).toFixed(2)} por{" "}
                      <span className="font-semibold text-gray-800">{ing.unidad_compra}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-bold bg-blue-50/40">
                      S/ {costoUso.toFixed(4)} por{" "}
                      <span className="text-blue-900 font-black">{ing.unidad_uso}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 font-medium">
                      {Number(ing.porcentaje_merma_estandar || 0).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEditClick(ing)}
                        className="text-blue-600 hover:text-blue-900 font-bold hover:underline"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ing.id, ing.nombre)}
                        disabled={deletingId === ing.id}
                        className="text-red-500 hover:text-red-800 font-bold hover:underline disabled:opacity-50"
                      >
                        {deletingId === ing.id ? "Eliminando..." : "🗑️ Eliminar"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingIng && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-black text-lg flex items-center gap-2">
                ✏️ Editar Insumo
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  value={editingIng.nombre}
                  onChange={(e) =>
                    setEditingIng({ ...editingIng, nombre: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Unidades */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Unidad de Compra
                  </label>
                  <input
                    type="text"
                    value={editingIng.unidad_compra}
                    onChange={(e) =>
                      setEditingIng({ ...editingIng, unidad_compra: e.target.value })
                    }
                    placeholder="Ej: Saco, Kg, Balde"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Unidad de Uso
                  </label>
                  <input
                    type="text"
                    value={editingIng.unidad_uso}
                    onChange={(e) =>
                      setEditingIng({ ...editingIng, unidad_uso: e.target.value })
                    }
                    placeholder="Ej: gramos, ml, unidad"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Factor y Costo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Factor de Conversión
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingIng.factor_conversion}
                    onChange={(e) =>
                      setEditingIng({
                        ...editingIng,
                        factor_conversion: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-bold"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    1 {editingIng.unidad_compra} = {editingIng.factor_conversion} {editingIng.unidad_uso}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Costo Compra (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingIng.costo_unitario}
                    onChange={(e) =>
                      setEditingIng({
                        ...editingIng,
                        costo_unitario: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-black text-gray-900 bg-amber-50/50"
                  />
                </div>
              </div>

              {/* Merma */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Merma Estándar (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editingIng.porcentaje_merma_estandar}
                  onChange={(e) =>
                    setEditingIng({
                      ...editingIng,
                      porcentaje_merma_estandar: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                />
              </div>

              {/* Cálculo en vivo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-blue-900">Nuevo Costo por {editingIng.unidad_uso}:</span>
                  <p className="text-[11px] text-blue-700">Se recalcula en todas tus recetas automáticamente.</p>
                </div>
                <span className="text-base font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs">
                  S/ {costoUsoCalculado}
                </span>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
