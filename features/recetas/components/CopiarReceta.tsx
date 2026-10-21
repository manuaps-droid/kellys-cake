"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Loader2, X } from "lucide-react";

import {
  leerItemsDeRecetaAction,
  type ItemCopiado,
} from "../actions/copiar-receta.action";

type RecetaOpcion = {
  id: string;
  productoNombre: string;
  rendimiento: number;
};

type Props = {
  recetas: RecetaOpcion[];
  onCopiar: (items: ItemCopiado[], rendimiento: number) => void;
};

export default function CopiarReceta({
  recetas,
  onCopiar,
}: Props) {
  const [seleccionada, setSeleccionada] = useState<string>("");
  const [copiando, startTransition] = useTransition();

  function copiar() {
    if (!seleccionada) return;

    startTransition(async () => {
      const { items, rendimiento } =
        await leerItemsDeRecetaAction(seleccionada);

      if (items.length === 0) {
        toast.error("No se pudieron leer los ingredientes de esa receta.");
        return;
      }

      onCopiar(items, rendimiento);
      toast.success(
        `${items.length} ingredientes copiados. Ajusta las cantidades o agrega más.`
      );
      setSeleccionada("");
    });
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-5">
      <p className="mb-3 text-sm font-bold text-indigo-900">
        📋 Copiar ingredientes de otra receta
      </p>
      <p className="mb-3 text-xs text-indigo-600">
        Selecciona una receta existente y se cargarán todos sus ingredientes aquí —
        luego puedes ajustar cantidades, cambiar ingredientes o agregar nuevos.
      </p>

      <div className="flex flex-wrap gap-2">
        {recetas.map((rec) => (
          <button
            key={rec.id}
            type="button"
            onClick={() =>
              setSeleccionada(seleccionada === rec.id ? "" : rec.id)
            }
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              seleccionada === rec.id
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            {rec.productoNombre}
            <span className="ml-1 font-normal opacity-60">
              (rinde {rec.rendimiento})
            </span>
          </button>
        ))}
      </div>

      {seleccionada && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={copiar}
            disabled={copiando}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {copiando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copiar a esta receta
          </button>
          <button
            type="button"
            onClick={() => setSeleccionada("")}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-500 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
