"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recetaSchema, RecetaFormValues } from "../validations/receta-schema";
import { useState } from "react";
import { guardarReceta } from "../actions/receta-actions";

type IngredienteOpcion = { id: string; nombre: string; unidad_uso: string; costo_por_unidad_uso: number; porcentaje_merma_estandar: number };

export function RecetaEditor({ productoId, ingredientesDisponibles }: { productoId: string, ingredientesDisponibles: IngredienteOpcion[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(recetaSchema),
    defaultValues: {
      producto_id: productoId,
      nombre: "Receta Principal",
      rendimiento: 1,
      items: [{ ingrediente_id: "", cantidad: 0, unidad: "", merma_porcentaje: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items");
  const rendimientoWatch = watch("rendimiento") || 1;

  const costoTotalVisual = (watchedItems || []).reduce((acc: number, item: any) => {
    const ingDB = ingredientesDisponibles.find(i => i.id === item.ingrediente_id);
    if (!ingDB) return acc;
    
    const costoUso = ingDB.costo_por_unidad_uso || 0;
    const mermaTotal = (ingDB.porcentaje_merma_estandar + (Number(item.merma_porcentaje) || 0)) / 100;
    const factorMerma = 1 - (mermaTotal >= 1 ? 0.99 : mermaTotal);
    const costoLinea = (Number(item.cantidad) / factorMerma) * costoUso;
    
    return acc + costoLinea;
  }, 0);

  const costoUnitarioVisual = rendimientoWatch > 0 ? costoTotalVisual / rendimientoWatch : 0;

  const onSubmit = async (data: RecetaFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await guardarReceta(data);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      alert("¡Receta guardada! El costo de tu producto ha sido actualizado.");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-white p-6 rounded-lg shadow-sm border">
      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{errorMsg}</div>}
      {errors.items && <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-4">{errors.items?.message as string}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rendimiento (Porciones / Unidades)</label>
          <input type="number" step="0.1" {...register("rendimiento")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
        </div>
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 flex flex-col justify-center items-end">
          <p className="text-sm text-blue-700 font-semibold">Costo Estimado Unitario</p>
          <p className="text-2xl font-bold text-blue-900">S/ {costoUnitarioVisual.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Ingredientes de la Receta</h3>
        
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md border">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">Ingrediente</label>
              <select 
                {...register(`items.${index}.ingrediente_id` as const)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
                onChange={(e) => {
                  const ing = ingredientesDisponibles.find(i => i.id === e.target.value);
                  if(ing) setValue(`items.${index}.unidad` as const, ing.unidad_uso);
                }}
              >
                <option value="">Seleccionar...</option>
                {ingredientesDisponibles.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-500 uppercase">Cantidad</label>
              <input type="number" step="any" {...register(`items.${index}.cantidad` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" />
            </div>

            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 uppercase">Unidad</label>
              <input readOnly {...register(`items.${index}.unidad` as const)} className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 p-2 text-sm text-gray-500" />
            </div>
            
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 uppercase">Merma Ex. %</label>
              <input type="number" step="0.1" {...register(`items.${index}.merma_porcentaje` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" title="Merma extra específica para esta receta" />
            </div>

            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 font-bold">X</button>
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={() => append({ ingrediente_id: "", cantidad: 0, unidad: "", merma_porcentaje: 0 })}
          className="text-blue-600 font-medium text-sm hover:underline"
        >
          + Añadir otro ingrediente
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Calculando y Guardando..." : "Guardar Receta"}
        </button>
      </div>
    </form>
  );
}
