"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { deleteCustomerAction } from "../actions/delete-customer.action";

type Props = {
  customerId: string;
  customerName: string;
  redirectToList?: boolean;
};

export default function DeleteCustomerButton({
  customerId,
  customerName,
  redirectToList = false,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente a "${customerName.trim()}"?\n\n` +
        "Se borrarán de forma permanente sus pedidos, carrito, proyectos, reseñas y cuenta de acceso. Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    const result = await deleteCustomerAction(customerId);

    if (!result.success) {
      toast.error(
        result.message ?? "No se pudo eliminar el cliente."
      );
      return;
    }

    toast.success(
      result.message ?? "Cliente eliminado correctamente.",
      { duration: 5000 }
    );

    if (redirectToList) {
      router.replace("/admin/clientes");
      router.refresh();
      return;
    }

    router.refresh();
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