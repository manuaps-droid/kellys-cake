"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { compraSchema, CompraFormValues } from "../validations/compra-schema";
import { useState } from "react";
import { registrarCompra } from "../actions/compra-actions";

export function CompraEditor({ ingredientes }: { ingredientes: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      items: [{ ingrediente_id: "", cantidad: 0, precio_total: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const totalFactura = (watchedItems || []).reduce((acc: number, item: any) => acc + (Number(item?.precio_total) || 0), 0);

  const onSubmit = async (data: CompraFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await registrarCompra(data);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      alert("¡Compra registrada! Los costos de tus ingredientes y recetas se han actualizado automáticamente.");
      reset();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-white p-6 rounded-lg shadow-sm border">
      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{errorMsg}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Compra</label>
          <input type="date" {...register("fecha")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nº Documento / Factura (Opcional)</label>
          <input type="text" {...register("numero_factura")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2 flex justify-between">
          <span>Detalle de Factura</span>
          <span className="text-blue-700 font-bold">Total: S/ {totalFactura.toFixed(2)}</span>
        </h3>
        
        {fields.map((field, index) => {
          // Buscamos el ingrediente para mostrar su unidad de compra
          const ingSeleccionado = ingredientes.find(i => i.id === watchedItems[index]?.ingrediente_id);
          
          return (
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md border">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase">Ingrediente</label>
                <select {...register(`items.${index}.ingrediente_id` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {ingredientes.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
                <div className="relative mt-1">
                  <input type="number" step="any" {...register(`items.${index}.cantidad` as const)} className="block w-full rounded-md border border-gray-300 p-2 text-sm" />
                  <span className="absolute right-2 top-2 text-xs text-gray-400">{ingSeleccionado?.unidad_compra || ''}</span>
                </div>
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase">Total Pagado (S/)</label>
                <input type="number" step="0.01" {...register(`items.${index}.precio_total` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" />
              </div>

              <div className="w-24 pb-2 text-right">
                <span className="text-xs text-gray-500 block">Unitario</span>
                <span className="text-sm font-semibold text-blue-600">
                  S/ { (Number(watchedItems[index]?.precio_total) / (Number(watchedItems[index]?.cantidad) || 1)).toFixed(2) }
                </span>
              </div>

              <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 font-bold mb-1">X</button>
            </div>
          )
        })}
        
        <button type="button" onClick={() => append({ ingrediente_id: "", cantidad: 0, precio_total: 0 })} className="text-blue-600 font-medium text-sm hover:underline">
          + Añadir línea
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Procesando..." : "Registrar Compra"}
        </button>
      </div>
    </form>
  );
}
