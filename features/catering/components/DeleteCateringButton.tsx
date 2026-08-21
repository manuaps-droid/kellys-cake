"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { deleteCateringRequest } from "@/features/catering/actions/delete-catering.action";

type Props = {
  id: string;
  clienteNombre?: string | null;
};

export default function DeleteCateringButton({
  id,
  clienteNombre,
}: Props) {
  const [confirming, setConfirming] =
    useState(false);
  const [pending, startTransition] =
    useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result =
        await deleteCateringRequest(id);

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo eliminar la solicitud."
        );

        return;
      }

      toast.success(
        "Solicitud eliminada."
      );
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-xs text-gray-500">
          ¿Eliminar solicitud?
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {pending
              ? "Eliminando..."
              : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={`Eliminar solicitud de ${clienteNombre ?? "catering"}`}
      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Eliminar
    </button>
  );
}
