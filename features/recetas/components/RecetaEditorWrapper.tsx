"use client";

import { useState } from "react";

import { RecetaEditor } from "./RecetaEditor";
import CopiarReceta from "./CopiarReceta";
import type { ItemCopiado } from "../actions/copiar-receta.action";

type IngredienteOpcion = {
  id: string;
  nombre: string;
  unidad_uso: string;
  costo_por_unidad_uso: number;
  porcentaje_merma_estandar: number;
};

type ItemInicial = {
  ingrediente_id: string;
  cantidad: number;
  unidad: string;
  merma_porcentaje: number;
};

type RecetaOpcion = {
  id: string;
  productoNombre: string;
  rendimiento: number;
};

type Props = {
  productoId: string;
  productoNombre: string;
  productoPrecioVenta: number;
  productoPrecioCosto: number;
  ingredientes: IngredienteOpcion[];
  itemsIniciales: ItemInicial[];
  rendimientoInicial: number;
  recetasDisponibles: RecetaOpcion[];
};

export default function RecetaEditorWrapper({
  productoId,
  productoNombre,
  productoPrecioVenta,
  ingredientes,
  itemsIniciales,
  rendimientoInicial,
  recetasDisponibles,
}: Props) {
  const [items, setItems] = useState<ItemInicial[]>(itemsIniciales);
  const [rendimiento, setRendimiento] = useState(rendimientoInicial);
  const [mostrarCopiar, setMostrarCopiar] = useState(
    itemsIniciales.length === 0 && recetasDisponibles.length > 0
  );

  // Datos del producto editables (nombre y precio) — viven aquí para
  // sobrevivir al remount del editor al copiar recetas.
  const [nombreEdit, setNombreEdit] = useState(productoNombre);
  const [precioEdit, setPrecioEdit] = useState(
    productoPrecioVenta > 0 ? String(productoPrecioVenta) : ""
  );

  function handleCopiar(
    itemsCopiados: ItemCopiado[],
    nuevoRendimiento: number
  ) {
    setItems(
      itemsCopiados.map((i) => ({
        ingrediente_id: i.ingrediente_id,
        cantidad: i.cantidad,
        unidad: i.unidad,
        merma_porcentaje: i.merma_porcentaje,
      }))
    );
    setRendimiento(nuevoRendimiento);
    setMostrarCopiar(false);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Receta: {nombreEdit}
        </h1>
        <p className="text-gray-500">
          {items.length > 0
            ? "Edita las cantidades o agrega/quita ingredientes. El costo se recalcula al guardar."
            : "Añade ingredientes para descubrir el costo exacto."}
        </p>
      </div>

      {mostrarCopiar && (
        <div className="mb-6">
          <CopiarReceta recetas={recetasDisponibles} onCopiar={handleCopiar} />
        </div>
      )}

      {items.length === 0 && !mostrarCopiar && recetasDisponibles.length > 0 && (
        <button
          type="button"
          onClick={() => setMostrarCopiar(true)}
          className="mb-4 text-xs font-semibold text-indigo-600 hover:underline"
        >
          📋 Copiar ingredientes de otra receta ({recetasDisponibles.length} disponibles)
        </button>
      )}

      {recetasDisponibles.length === 0 && (
        <p className="mb-4 text-[10px] text-gray-400">
          Debug: 0 recetas disponibles para copiar
        </p>
      )}

      <RecetaEditor
        key={`receta-${items.length}-${rendimiento}`}
        productoId={productoId}
        productoNombre={nombreEdit}
        onNombreChange={setNombreEdit}
        productoPrecioVenta={precioEdit}
        onPrecioChange={setPrecioEdit}
        ingredientesDisponibles={ingredientes}
        itemsIniciales={items}
        rendimientoInicial={rendimiento}
        recetasDisponibles={recetasDisponibles}
      />
    </>
  );
}
