"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { eliminarProductoAction } from "../actions/producto-actions";

type Props = {
  productoId: string;
  nombre: string;
};

export default function EliminarProductoButton({ productoId, nombre }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function eliminar() {
    const ok = window.confirm(
      `¿Eliminar "${nombre}" y su receta?\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    startTransition(async () => {
      const res = await eliminarProductoAction(productoId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Producto y receta eliminados");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={eliminar}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
