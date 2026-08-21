"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCart } from "@/features/cart/hooks/useCart";

import { loadCotizacionToCartAction } from "../actions/load-cotizacion.action";

type Props = {
  token: string;
  estado: string;
};

export default function CargarCotizacionButton({ token, estado }: Props) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(false);

  const disponible = estado === "enviada" || estado === "aceptada";

  if (!disponible) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Esta cotización ya fue procesada. Si necesitas ayuda, contáctanos por WhatsApp.
      </p>
    );
  }

  async function handleCargar() {
    setLoading(true);

    try {
      const result = await loadCotizacionToCartAction(token);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Cotización agregada a tu carrito");
      await refreshCart();
      router.push("/carrito");
    } catch {
      // El redirect a login lo maneja el router automáticamente
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCargar()}
      disabled={loading}
      className="w-full rounded-full bg-kc-rose-gold px-8 py-4 text-base font-semibold text-white shadow-lg shadow-kc-rose-gold/20 transition hover:bg-kc-gold disabled:opacity-60"
    >
      {loading ? "Agregando..." : "🛒 Agregar al carrito y pagar"}
    </button>
  );
}
