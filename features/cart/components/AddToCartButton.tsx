"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { addToCartAction } from "../actions/add-to-cart.action";
import { useCart } from "../hooks/useCart";

type Props = {
  productoId: string;
  presentacionId?: string | null;
  className?: string;
};

export default function AddToCartButton({
  productoId,
  presentacionId = null,
  className = "w-full",
}: Props) {
  const [pending, startTransition] =
    useTransition();

  const {
    refreshCart,
    openDrawer,
  } = useCart();

  function handleClick() {
    startTransition(async () => {
      const result =
        await addToCartAction(
          productoId,
          presentacionId
        );

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo agregar el producto."
        );

        return;
      }

      await refreshCart();

      openDrawer();

      toast.success(
        "Producto agregado al carrito."
      );
    });
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={className}
    >
      {pending
        ? "Agregando..."
        : "Agregar al carrito"}
    </Button>
  );
}