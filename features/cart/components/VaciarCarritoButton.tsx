"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

import { clearCart } from "../actions/clear-cart.action";

import { useCart } from "../hooks/useCart";

type Props = {
  disabled?: boolean;
};

export default function VaciarCarritoButton({
  disabled = false,
}: Props) {
  const [pending, startTransition] = useTransition();
  const { refreshCart } = useCart();

  function handleClear() {
    if (!window.confirm("¿Seguro que deseas vaciar tu carrito?")) {
      return;
    }

    startTransition(async () => {
      const result = await clearCart();

      if (result.success) {
        await refreshCart();
        toast.success("Carrito vaciado");
      } else {
        toast.error(result.message ?? "Error al vaciar el carrito.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleClear}
      disabled={pending || disabled}
    >
      {pending ? "Vaciando..." : "Vaciar carrito"}
    </Button>
  );
}
