"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ingredienteSchema, IngredienteFormValues } from "../validations/ingrediente-schema";
import { useState } from "react";
import { crearIngrediente } from "../actions/ingrediente-actions";

export function IngredienteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(ingredienteSchema),
    defaultValues: {
      factor_conversion: 1000,
      porcentaje_rendimiento: 100,
      porcentaje_merma_estandar: 0,
    }
  });

  // Cálculo en tiempo real del costo por unidad de uso para UI
  const costoUnitario = watch("costo_unitario") || 0;
  const factor = watch("factor_conversion") || 1;
  const costoPorUso = (costoUnitario / factor).toFixed(4);

  const onSubmit = async (data: IngredienteFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await crearIngrediente(data);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        alert("¡Ingrediente guardado con éxito!");
        reset(); // Limpia el formulario
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-sm border">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Nombre del Ingrediente</label>
          <input 
            {...register("nombre")} 
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
            placeholder="Ej: Chocolate Bitter 70%" 
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre?.message as string}</p>}
        </div>

        {/* Unidades */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidad de Compra</label>
          <input {...register("unidad_compra")} placeholder="Ej: Kg" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
          {errors.unidad_compra && <p className="text-red-500 text-sm mt-1">{errors.unidad_compra?.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidad de Uso</label>
          <input {...register("unidad_uso")} placeholder="Ej: Gramo" className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
          {errors.unidad_uso && <p className="text-red-500 text-sm mt-1">{errors.unidad_uso?.message as string}</p>}
        </div>

        {/* Factor de Conversión */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Factor de Conversión</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">1 Unidad Compra =</span>
            <input type="number" step="any" {...register("factor_conversion")} className="block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
            <span className="text-sm text-gray-500">Unidades Uso</span>
          </div>
        </div>

        {/* Costo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Costo por Unidad de Compra (S/)</label>
          <input type="number" step="0.01" {...register("costo_unitario")} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
        </div>

        {/* Resumen Automático */}
        <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-800">Cálculo de Costo Automático</h4>
          <p className="text-sm text-blue-600 mt-1">
            El costo por cada <strong>unidad de uso</strong> será de: <span className="font-bold text-lg">S/ {costoPorUso}</span>
          </p>
        </div>

        {/* Mermas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Merma Estándar (%)</label>
          <input type="number" step="0.1" {...register("porcentaje_merma_estandar")} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar Ingrediente"}
        </button>
      </div>
    </form>
  );
}
