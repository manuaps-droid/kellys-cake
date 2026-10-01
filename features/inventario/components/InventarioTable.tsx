"use client";

import { useState } from "react";

export function InventarioTable({ inventario, almacenes }: { inventario: any[]; almacenes: any[] }) {
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<string>("");

  const itemsFiltrados = almacenSeleccionado
    ? inventario.filter(i => i.almacen?.id === almacenSeleccionado)
    : inventario;

  const valorTotalInventario = itemsFiltrados.reduce((sum, item) => {
    const stock = Number(item.stock_actual || 0);
    const costo = Number(item.ingrediente?.costo_unitario || 0);
    return sum + (stock * costo);
  }, 0);

  const itemsCriticos = itemsFiltrados.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo));

  return (
    <div className="space-y-6">
      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Valorización del Stock</p>
          <p className="text-3xl font-black text-gray-900 mt-2">S/ {valorTotalInventario.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Capital inmovilizado en insumos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Insumos Registrados</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{itemsFiltrados.length}</p>
          <p className="text-xs text-gray-500 mt-1">En el almacén seleccionado</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Alertas de Stock Bajo</p>
          <p className={`text-3xl font-black mt-2 ${itemsCriticos.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {itemsCriticos.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Requieren compra urgente</p>
        </div>
      </div>

      {/* FILTRO ALMACÉN */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">Filtrar por Almacén:</label>
          <select 
            value={almacenSeleccionado}
            onChange={(e) => setAlmacenSeleccionado(e.target.value)}
            className="rounded-md border border-gray-300 p-2 text-sm bg-white"
          >
            <option value="">🏢 Todos los Almacenes</option>
            {almacenes.map(a => (
              <option key={a.id} value={a.id}>{a.nombre} {a.es_principal ? '(Principal)' : ''}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400">Actualizado en tiempo real tras cada compra/receta</span>
      </div>

      {/* TABLA INVENTARIO */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ingrediente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Almacén</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock Actual</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock Mínimo</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Valor Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white text-sm">
            {itemsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No hay registros de inventario aún. Se alimentará automáticamente con tus facturas escaneadas o compras.
                </td>
              </tr>
            ) : (
              itemsFiltrados.map((item) => {
                const stock = Number(item.stock_actual || 0);
                const min = Number(item.stock_minimo || 5);
                const costo = Number(item.ingrediente?.costo_unitario || 0);
                const valorFila = stock * costo;
                const esBajo = stock <= min;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.ingrediente?.nombre || "Insumo"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.almacen?.nombre || "Almacén"}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {stock.toFixed(2)} <span className="text-xs font-normal text-gray-500">{item.ingrediente?.unidad_compra}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {min.toFixed(2)} {item.ingrediente?.unidad_compra}
                    </td>
                    <td className="px-6 py-4">
                      {esBajo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          ⚠️ Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          ✓ Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">
                      S/ {valorFila.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
