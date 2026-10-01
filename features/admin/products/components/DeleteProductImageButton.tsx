"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteProduct } from "../actions/delete-product.action";

type Props = {
  productId: string;
  productName: string;
};

export default function DeleteProductImageButton({
  productId,
  productName,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar el producto "${productName}"?`)) {
      return;
    }

    const result = await deleteProduct(productId);

    if (!result.success) {
      toast.error(result.message ?? "No se pudo eliminar el producto.");
      return;
    }

    toast.success("Producto eliminado correctamente.");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      aria-label={`Eliminar ${productName}`}
      title="Eliminar producto"
      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500/90 text-white shadow transition hover:bg-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}