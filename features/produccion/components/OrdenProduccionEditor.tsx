"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordenProduccionSchema, OrdenProduccionFormValues } from "../validations/produccion-schema";
import { useState } from "react";
import { crearOrdenProduccion } from "../actions/produccion-actions";

export function OrdenProduccionEditor({ productos }: { productos: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(ordenProduccionSchema),
    defaultValues: {
      fecha_prevista: new Date().toISOString().split("T")[0],
      items: [{ producto_id: "", cantidad: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit = async (data: OrdenProduccionFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await crearOrdenProduccion(data);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl bg-white p-6 rounded-lg shadow-sm border">
      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{errorMsg}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Producción</label>
          <input type="date" {...register("fecha_prevista")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notas / Lote (Opcional)</label>
          <input type="text" {...register("notas")} placeholder="Ej: Pedidos Sábado" className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">¿Qué vamos a hornear/preparar?</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md border">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">Producto</label>
              <select {...register(`items.${index}.producto_id` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm">
                <option value="">Seleccionar...</option>
                {productos.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
              <input type="number" step="any" {...register(`items.${index}.cantidad` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" />
            </div>

            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 font-bold mb-1">X</button>
          </div>
        ))}
        
        <button type="button" onClick={() => append({ producto_id: "", cantidad: 1 })} className="text-blue-600 font-medium text-sm hover:underline">
          + Añadir otro producto
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Calculando..." : "Generar Consolidado de Insumos"}
        </button>
      </div>
    </form>
  );
}
