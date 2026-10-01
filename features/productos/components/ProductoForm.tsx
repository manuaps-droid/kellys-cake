"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productoSchema, ProductoFormValues } from "../validations/producto-schema";
import { useState } from "react";
import { crearProducto } from "../actions/producto-actions";

export function ProductoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<any>({
    resolver: zodResolver(productoSchema),
    defaultValues: { precio_venta: 0 }
  });

  const onSubmit = async (data: ProductoFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await crearProducto(data);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      alert("¡Producto creado! Ahora podrás asignarle una receta para conocer su margen de ganancia.");
      reset();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl bg-white p-6 rounded-lg shadow-sm border">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4"><p className="text-sm text-red-700">{errorMsg}</p></div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
        <input {...register("nombre")} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" placeholder="Ej: Torta de Chocolate de 15 porciones" />
        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre?.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Precio de Venta al Público (S/)</label>
        <input type="number" step="0.1" {...register("precio_venta")} className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm" />
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Guardando..." : "Crear Producto"}
        </button>
      </div>
    </form>
  );
}
