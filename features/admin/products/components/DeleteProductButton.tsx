"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { deleteProduct } from "../actions/delete-product.action";

type DeleteProductButtonProps = {
  productId: string;
};

export default function DeleteProductButton({
  productId,
}: DeleteProductButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Deseas eliminar este producto?"
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteProduct(productId);

    if (!result.success) {
      toast.error(
        result.message ??
          "No se pudo eliminar el producto."
      );

      return;
    }

    toast.success("Producto eliminado correctamente.");

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
    >
      Eliminar
    </Button>
  );
}