"use client";

import { useState } from "react";
import { registrarCompra } from "../actions/compra-actions";
import { registrarIngresoStock } from "@/features/inventario/actions/inventario-actions";

type OcrItem = {
  nombre: string;
  cantidad: number;
  unidad?: string;
  precio_unitario?: number;
  precio_total: number;
  ingrediente_id?: string;
};

type OcrResult = {
  proveedor?: string | null;
  ruc?: string | null;
  numero_factura?: string | null;
  fecha?: string | null;
  items: OcrItem[];
  subtotal?: number | null;
  igv?: number | null;
  total?: number | null;
};

type Ingrediente = {
  id: string;
  nombre: string;
};

type Almacen = {
  id: string;
  nombre: string;
  es_principal?: boolean;
};

export function FacturaReview({
  data,
  ingredientes,
  almacenes = [],
  onBack,
}: {
  data: OcrResult;
  ingredientes: Ingrediente[];
  almacenes?: Almacen[];
  onBack: () => void;
}) {
  const [items, setItems] = useState<OcrItem[]>(
    data.items.map((item) => ({
      ...item,
      ingrediente_id: autoMatchIngrediente(item.nombre, ingredientes),
    }))
  );

  const [almacenDestinoId, setAlmacenDestinoId] = useState<string>(
    almacenes.find(a => a.es_principal)?.id || almacenes[0]?.id || ""
  );

  const [cabecera, setCabecera] = useState({
    proveedor: data.proveedor || "",
    numero_factura: data.numero_factura || "",
    fecha: data.fecha || new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalCalculado = items.reduce(
    (sum, item) => sum + (item.precio_total || 0),
    0
  );

  const updateItem = (index: number, field: keyof OcrItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "cantidad" || field === "precio_unitario") {
        const qty = field === "cantidad" ? Number(value) : Number(updated[index].cantidad);
        const pu = field === "precio_unitario" ? Number(value) : Number(updated[index].precio_unitario || 0);
        if (qty > 0 && pu > 0) {
          updated[index].precio_total = Math.round(qty * pu * 100) / 100;
        }
      }

      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        nombre: "",
        cantidad: 1,
        unidad: "unidad",
        precio_unitario: 0,
        precio_total: 0,
        ingrediente_id: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const sinVincular = items.filter((i) => !i.ingrediente_id);
    if (sinVincular.length > 0) {
      setError(
        "Vincula todos los ítems con un ingrediente del sistema antes de guardar. Los ítems sin vincular están marcados en rojo."
      );
      return;
    }

    if (items.length === 0) {
      setError("Agrega al menos un ítem a la compra.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // 1. Guardar la Compra y disparar el recalculo de recetas
    const compraData = {
      fecha: cabecera.fecha,
      numero_factura: cabecera.numero_factura || undefined,
      items: items.map((item) => ({
        ingrediente_id: item.ingrediente_id!,
        cantidad: Number(item.cantidad),
        precio_total: Number(item.precio_total),
      })),
    };

    const resultCompra = await registrarCompra(compraData);

    if ("error" in resultCompra) {
      setError(resultCompra.error ?? "Ocurrió un error");
      setIsSubmitting(false);
      return;
    }

    // 2. Ingresar stock físico al Almacén seleccionado y Kardex
    if (almacenDestinoId) {
      await registrarIngresoStock({
        almacenId: almacenDestinoId,
        items: items.map(i => ({
          ingredienteId: i.ingrediente_id!,
          cantidad: Number(i.cantidad),
          costoUnitario: Number(i.precio_unitario || (i.precio_total / i.cantidad))
        })),
        referencia: cabecera.numero_factura ? `Factura ${cabecera.numero_factura}` : `Compra ${cabecera.fecha}`
      });
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <div className="text-7xl">📦</div>
        <h2 className="text-2xl font-bold text-gray-900">
          ¡Compra e Inventario Actualizados!
        </h2>
        <p className="text-gray-500">
          Se han actualizado los costos de tus recetas y el <strong>stock físico</strong> ingresó exitosamente al almacén.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700"
          >
            📸 Escanear otra factura
          </button>
          <a
            href="/foodos/inventario"
            className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 shadow-md"
          >
            📦 Ver Inventario y Stock
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecera y Selección de Almacén */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Datos de la Factura
          </h3>
          
          {/* SELECTOR DE ALMACÉN DE DESTINO */}
          {almacenes.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <span className="text-sm font-bold text-amber-900">🏢 Ingresar a:</span>
              <select
                value={almacenDestinoId}
                onChange={(e) => setAlmacenDestinoId(e.target.value)}
                className="text-sm font-bold bg-white border border-amber-300 rounded px-2 py-1 text-gray-800"
              >
                {almacenes.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.es_principal ? '(Principal)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Proveedor</label>
            <input
              type="text"
              value={cabecera.proveedor}
              onChange={(e) => setCabecera((p) => ({ ...p, proveedor: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">N° Factura / Boleta</label>
            <input
              type="text"
              value={cabecera.numero_factura}
              onChange={(e) => setCabecera((p) => ({ ...p, numero_factura: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Fecha</label>
            <input
              type="date"
              value={cabecera.fecha}
              onChange={(e) => setCabecera((p) => ({ ...p, fecha: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabla de ítems */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Ítems Detectados ({items.length})
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            + Agregar ítem manual
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={index}
              className={`px-6 py-4 flex gap-3 items-end ${
                !item.ingrediente_id ? "bg-red-50/50" : ""
              }`}
            >
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">
                  Producto (factura)
                </label>
                <input
                  type="text"
                  value={item.nombre}
                  onChange={(e) => updateItem(index, "nombre", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold text-blue-600 uppercase">
                  Vincular con ingrediente ↓
                </label>
                <select
                  value={item.ingrediente_id || ""}
                  onChange={(e) => updateItem(index, "ingrediente_id", e.target.value)}
                  className={`mt-1 w-full rounded-md border p-2 text-sm ${
                    !item.ingrediente_id
                      ? "border-red-400 bg-red-50"
                      : "border-blue-300 bg-blue-50 font-semibold"
                  }`}
                >
                  <option value="">-- Seleccionar ingrediente --</option>
                  {ingredientes.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Cant. (Stock+)</label>
                <input
                  type="number"
                  step="any"
                  value={item.cantidad}
                  onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm font-bold"
                />
              </div>

              <div className="w-20">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">Unidad</label>
                <input
                  type="text"
                  value={item.unidad || ""}
                  onChange={(e) => updateItem(index, "unidad", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>

              <div className="w-24">
                <label className="block text-[10px] font-bold text-gray-400 uppercase">P. Unit.</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.precio_unitario || ""}
                  onChange={(e) => updateItem(index, "precio_unitario", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm"
                />
              </div>

              <div className="w-28">
                <label className="block text-[10px] font-bold text-green-700 uppercase">Total (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.precio_total}
                  onChange={(e) => updateItem(index, "precio_total", Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-green-400 bg-green-50 p-2 text-sm font-bold"
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-600 p-2 text-lg font-bold mb-1"
                title="Eliminar este ítem"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {data.total && (
              <span>Total en factura: <strong>S/ {data.total.toFixed(2)}</strong></span>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 mr-2">Total a registrar:</span>
            <span className="text-xl font-black text-gray-900">S/ {totalCalculado.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          ← Volver a escanear
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg disabled:opacity-50 transition-all text-lg flex items-center gap-2"
        >
          {isSubmitting ? "Procesando Entrada..." : "✅ Confirmar Compra e Ingreso a Stock"}
        </button>
      </div>
    </div>
  );
}

function autoMatchIngrediente(nombreFactura: string, ingredientes: Ingrediente[]): string {
  const nombre = nombreFactura.toLowerCase().trim();
  for (const ing of ingredientes) {
    const ingNombre = ing.nombre.toLowerCase();
    if (ingNombre.includes(nombre) || nombre.includes(ingNombre)) return ing.id;
  }
  const palabras = nombre.split(/\s+/).filter((p) => p.length > 3);
  for (const ing of ingredientes) {
    const ingNombre = ing.nombre.toLowerCase();
    const coincidencias = palabras.filter((p) => ingNombre.includes(p));
    if (coincidencias.length >= 2 || (palabras.length === 1 && coincidencias.length === 1)) return ing.id;
  }
  return "";
}
