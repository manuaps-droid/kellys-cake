"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recetaSchema, RecetaFormValues } from "../validations/receta-schema";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Loader2, X } from "lucide-react";
import { guardarReceta } from "../actions/receta-actions";
import { leerItemsDeRecetaAction } from "../actions/copiar-receta.action";
import IngredienteAutocomplete from "@/features/ingredientes/components/IngredienteAutocomplete";
import type { IngredienteOpcionAutocomplete } from "@/features/ingredientes/actions/ingrediente-actions";

type IngredienteOpcion = { id: string; nombre: string; unidad_uso: string; costo_por_unidad_uso: number; porcentaje_merma_estandar: number };

type ItemInicial = {
  ingrediente_id: string;
  cantidad: number;
  unidad: string;
  merma_porcentaje: number;
};
type Props = {
  productoId: string;
  ingredientesDisponibles: IngredienteOpcion[];
  itemsIniciales?: ItemInicial[];
  rendimientoInicial?: number;
  recetasDisponibles?: Array<{
    id: string;
    productoNombre: string;
    rendimiento: number;
  }>;
};

export function RecetaEditor({
  productoId,
  ingredientesDisponibles,
  itemsIniciales = [],
  rendimientoInicial = 1,
  recetasDisponibles = [],
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ingredientesActualizados, setIngredientesActualizados] =
    useState<IngredienteOpcion[]>([]);
  const [mostrarCopiar, setMostrarCopiar] = useState(false);
  const [copiando, startCopiarTransition] = useTransition();
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>("");

  const ingredientes = [
    ...ingredientesActualizados,
    ...ingredientesDisponibles.filter(
      (d) => !ingredientesActualizados.some((u) => u.id === d.id)
    ),
  ];

  const itemsPorDefecto =
    itemsIniciales.length > 0
      ? itemsIniciales
      : [{ ingrediente_id: "", cantidad: 0, unidad: "", merma_porcentaje: 0 }];

  function copiarReceta(recetaId: string) {
    startCopiarTransition(async () => {
      const { items, rendimiento } =
        await leerItemsDeRecetaAction(recetaId);

      if (items.length === 0) {
        toast.error("No se pudieron leer los ingredientes de esa receta.");
        return;
      }

      reset({
        producto_id: productoId,
        nombre: "Receta Principal",
        rendimiento,
        items: items.map((i) => ({
          ingrediente_id: i.ingrediente_id,
          cantidad: i.cantidad,
          unidad: i.unidad,
          merma_porcentaje: i.merma_porcentaje,
        })),
      });

      setMostrarCopiar(false);
      setRecetaSeleccionada("");
      toast.success(
        `${items.length} ingredientes copiados. Ajusta las cantidades o agrega más.`
      );
    });
  }

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(recetaSchema),
    defaultValues: {
      producto_id: productoId,
      nombre: "Receta Principal",
      rendimiento: rendimientoInicial,
      items: itemsPorDefecto
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  type ItemWatch = {
    ingrediente_id: string;
    cantidad: number;
    unidad: string;
    merma_porcentaje: number;
  };

  const watchedItems = watch("items") as ItemWatch[];
  const rendimientoWatch = Number(watch("rendimiento")) || 1;

  const costoTotalVisual = (watchedItems || []).reduce((acc: number, item: ItemWatch) => {
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
      toast.success(
        `¡Receta guardada! Costo de ingredientes: S/ ${costoUnitarioVisual.toFixed(2)}/porción. Ver el costo completo en Rentabilidad & Costos.`,
        { duration: 5000 }
      );
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
        
        {fields.map((field, index) => {
          const itemActual = (watchedItems || [])[index];
          const ingActual = ingredientes.find(i => i.id === itemActual?.ingrediente_id);

          // Costo por línea: cantidad × costo unitario (ajustado por merma)
          const costoLinea = (() => {
            if (!ingActual) return 0;
            const cantidad = Number(itemActual?.cantidad) || 0;
            if (cantidad <= 0) return 0;
            const mermaTotal = (ingActual.porcentaje_merma_estandar + (Number(itemActual?.merma_porcentaje) || 0)) / 100;
            const factorMerma = 1 - (mermaTotal >= 1 ? 0.99 : mermaTotal);
            return (cantidad / factorMerma) * ingActual.costo_por_unidad_uso;
          })();

          function handleSeleccionado(nuevoIng: IngredienteOpcionAutocomplete) {
            setValue(`items.${index}.ingrediente_id` as const, nuevoIng.id);
            setValue(`items.${index}.unidad` as const, nuevoIng.unidad_uso);

            if (!ingredientes.some(i => i.id === nuevoIng.id)) {
              setIngredientesActualizados(prev => [
                ...prev,
                {
                  id: nuevoIng.id,
                  nombre: nuevoIng.nombre,
                  unidad_uso: nuevoIng.unidad_uso,
                  costo_por_unidad_uso: nuevoIng.costo_por_unidad_uso,
                  porcentaje_merma_estandar: nuevoIng.porcentaje_merma_estandar,
                },
              ]);
            }
          }

          return (
          <div key={field.id} className="bg-gray-50 p-3 rounded-md border space-y-2">
            <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 uppercase">
                Ingrediente
                {ingActual && (
                  <span className="ml-2 font-bold text-blue-600 normal-case">
                    S/ {ingActual.costo_por_unidad_uso.toFixed(4)}/{ingActual.unidad_uso}
                  </span>
                )}
              </label>
              <input
                type="hidden"
                {...register(`items.${index}.ingrediente_id` as const)}
              />
              <IngredienteAutocomplete
                value={itemActual?.ingrediente_id ?? ""}
                nombreSeleccionado={ingActual?.nombre}
                onSelect={handleSeleccionado}
              />
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

            <div className="w-28">
              <label className="block text-xs font-medium text-gray-500 uppercase">Total S/</label>
              <div className="mt-1 block w-full rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm font-bold text-emerald-700 text-right">
                {costoLinea > 0 ? `S/ ${costoLinea.toFixed(2)}` : "—"}
              </div>
            </div>

            <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-2 font-bold">X</button>
            </div>
          </div>
          );
        })}
        
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => append({ ingrediente_id: "", cantidad: 0, unidad: "", merma_porcentaje: 0 })}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            + Añadir otro ingrediente
          </button>

          {recetasDisponibles.length > 0 && (
            <span className="text-gray-300">|</span>
          )}

          {recetasDisponibles.length > 0 && !mostrarCopiar && (
            <button
              type="button"
              onClick={() => setMostrarCopiar(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar de otra receta
            </button>
          )}

          {mostrarCopiar && (
            <div className="w-full rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-900">
                  Copiar ingredientes de otra receta
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarCopiar(false);
                    setRecetaSeleccionada("");
                  }}
                  className="rounded p-1 text-indigo-400 hover:bg-indigo-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-3 text-xs text-indigo-600">
                Se reemplazarán todos los ingredientes actuales por los de la receta seleccionada.
              </p>
              <div className="flex flex-wrap gap-2">
                {recetasDisponibles.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setRecetaSeleccionada(rec.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      recetaSeleccionada === rec.id
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    {rec.productoNombre}
                    <span className="ml-1 font-normal opacity-60">
                      ({rec.rendimiento})
                    </span>
                  </button>
                ))}
              </div>
              {recetaSeleccionada && (
                <button
                  type="button"
                  onClick={() => copiarReceta(recetaSeleccionada)}
                  disabled={copiando}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {copiando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copiar {recetaSeleccionada ? "receta seleccionada" : ""}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Costo Total</p>
            <p className="text-lg font-bold text-gray-800">S/ {costoTotalVisual.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Costo por Porción</p>
            <p className="text-lg font-bold text-blue-700">S/ {costoUnitarioVisual.toFixed(2)}</p>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? "Calculando y Guardando..." : "Guardar Receta"}
        </button>
      </div>
    </form>
  );
}
