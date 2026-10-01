"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cotizacionSchema, CotizacionFormValues } from "../validations/cotizador-schema";
import { useState } from "react";
import { guardarCotizacion } from "../actions/cotizador-actions";

export function CotizacionEditor({ productos }: { productos: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      cliente_nombre: "",
      items: [{ tipo_item: "producto", producto_id: "", nombre_descripcion: "", cantidad: 1, costo_unitario: 0, precio_venta_unitario: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const totalCosto = (watchedItems || []).reduce((acc: number, i: any) => acc + (Number(i?.costo_unitario)*Number(i?.cantidad) || 0), 0);
  const totalVenta = (watchedItems || []).reduce((acc: number, i: any) => acc + (Number(i?.precio_venta_unitario)*Number(i?.cantidad) || 0), 0);
  const rentabilidadPorcentaje = totalVenta > 0 ? ((totalVenta - totalCosto) / totalVenta) * 100 : 0;
  
  const HUD_COLOR = rentabilidadPorcentaje >= 50 ? "bg-green-600" : (rentabilidadPorcentaje >= 30 ? "bg-yellow-500" : "bg-red-600");

  const onSubmit = async (data: CotizacionFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await guardarCotizacion(data);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl bg-white p-6 rounded-lg shadow-sm border">
      
      {/* HUD RENTABILIDAD EN VIVO */}
      <div className={`p-4 rounded-lg text-white mb-8 flex justify-between items-center shadow-inner ${HUD_COLOR}`}>
        <div>
          <p className="text-sm opacity-80 uppercase tracking-wider font-bold">Costo del Evento</p>
          <p className="text-2xl font-black">S/ {totalCosto.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm opacity-80 uppercase tracking-wider font-bold">Margen de Ganancia</p>
          <p className="text-4xl font-black">{rentabilidadPorcentaje.toFixed(1)}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80 uppercase tracking-wider font-bold">Precio Cliente</p>
          <p className="text-2xl font-black">S/ {totalVenta.toFixed(2)}</p>
        </div>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{errorMsg}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Cliente / Evento</label>
          <input type="text" {...register("cliente_nombre")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          {errors.cliente_nombre && <p className="text-red-500 text-xs mt-1">{errors.cliente_nombre?.message as string}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input type="date" {...register("fecha_evento")} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const tipo = watchedItems[index]?.tipo_item;
          return (
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md border border-slate-200">
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase">Tipo</label>
                <select {...register(`items.${index}.tipo_item` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm bg-white">
                  <option value="producto">Producto</option>
                  <option value="extra">Serv. Extra</option>
                </select>
              </div>

              {tipo === 'producto' ? (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Producto de Catálogo</label>
                  <select 
                    {...register(`items.${index}.producto_id` as const)} 
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                    onChange={(e) => {
                      const prod = productos.find(p => p.id === e.target.value);
                      if (prod) {
                        setValue(`items.${index}.nombre_descripcion` as const, prod.nombre);
                        setValue(`items.${index}.costo_unitario` as const, prod.precio_costo || 0);
                        setValue(`items.${index}.precio_venta_unitario` as const, prod.precio_venta || 0);
                      }
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Descripción del Servicio</label>
                  <input type="text" placeholder="Ej: Movilidad, Empaque Especial..." {...register(`items.${index}.nombre_descripcion` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm" />
                </div>
              )}
              
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-500 uppercase">Cant.</label>
                <input type="number" step="any" {...register(`items.${index}.cantidad` as const)} className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm font-bold" />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase" title="Costo interno congelado">Costo Unit. (S/)</label>
                <input type="number" step="0.01" {...register(`items.${index}.costo_unitario` as const)} readOnly={tipo === 'producto'} className={`mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm ${tipo === 'producto' ? 'bg-gray-200' : 'bg-white'}`} />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 uppercase text-blue-700">Precio Venta (S/)</label>
                <input type="number" step="0.01" {...register(`items.${index}.precio_venta_unitario` as const)} className="mt-1 block w-full rounded-md border-blue-400 p-2 text-sm bg-blue-50 font-bold" />
              </div>

              <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 font-bold mb-1">X</button>
            </div>
          )
        })}
        
        <div className="flex gap-4">
          <button type="button" onClick={() => append({ tipo_item: "producto", producto_id: "", nombre_descripcion: "", cantidad: 1, costo_unitario: 0, precio_venta_unitario: 0 })} className="text-blue-600 font-medium text-sm hover:underline">
            + Añadir Producto
          </button>
          <button type="button" onClick={() => append({ tipo_item: "extra", producto_id: "", nombre_descripcion: "", cantidad: 1, costo_unitario: 0, precio_venta_unitario: 0 })} className="text-slate-600 font-medium text-sm hover:underline">
            + Añadir Servicio Extra
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded-md font-bold hover:bg-slate-800 shadow-lg disabled:opacity-50">
          {isSubmitting ? "Guardando..." : "Guardar Cotización"}
        </button>
      </div>
    </form>
  );
}
