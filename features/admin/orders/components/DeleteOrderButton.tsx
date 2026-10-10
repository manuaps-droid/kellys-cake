"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { deleteOrderAction } from "../actions/delete-order.action";

type Props = {
  orderId: string;
  orderNumber: number | null;
  compact?: boolean;
};

export default function DeleteOrderButton({
  orderId,
  orderNumber,
  compact = false,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const etiqueta = orderNumber
      ? `#${orderNumber}`
      : "este pedido";

    const confirmed = window.confirm(
      `¿Eliminar definitivamente el pedido ${etiqueta}?\n\n` +
        "Se borrarán de forma permanente sus items y se quitará de la agenda de producción. Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    const result = await deleteOrderAction(orderId);

    if (!result.success) {
      toast.error(
        result.message ?? "No se pudo eliminar el pedido."
      );
      return;
    }

    toast.success(
      result.message ?? "Pedido eliminado correctamente."
    );

    router.refresh();
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="icon-xs"
        onClick={handleDelete}
        aria-label="Eliminar pedido"
        title="Eliminar pedido"
      >
        <Trash2 />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Eliminar
    </Button>
  );
}
