"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { addTopperToCartAction } from "@/features/cart/actions/add-topper-to-cart.action";
import { useCart } from "@/features/cart/hooks/useCart";
import { TOPPER_DISENAR_URL } from "@/features/customization/constants/topper.constants";

type Props = {
  topperProductoId?: string;
  precioBase?: number;
};

export default function TopperCrossSellModal({
  topperProductoId,
  precioBase = 16.99,
}: Props) {
  const { openDrawer } = useCart();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Muestra un banner sutil pero llamativo para complementar la torta
  return (
    <div className="mt-6 rounded-2xl border border-kc-rose-gold/30 bg-gradient-to-br from-amber-50/50 via-pink-50/30 to-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-kc-rose-gold/15 text-2xl shadow-inner">
          ✨
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-kc-rose-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-kc-rose-gold uppercase tracking-wider">
              Complemento estrella
            </span>
            <span className="text-xs font-bold text-kc-charcoal">
              + S/ {precioBase.toFixed(2)}
            </span>
          </div>

          <h4 className="mt-1 font-[family-name:var(--font-playfair)] text-base font-bold text-kc-charcoal">
            ¿Deseas coronar tu pastel con un Topper Personalizado?
          </h4>

          <p className="mt-1 text-xs text-kc-mocha leading-relaxed">
            Añade el nombre del festejado en impresión 3D personalizada para coronar tu pastel.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={TOPPER_DISENAR_URL}
              className="inline-flex items-center gap-1.5 rounded-full bg-kc-charcoal px-4 py-2 text-xs font-medium text-kc-cream transition-all hover:bg-kc-deep hover:shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-kc-rose-gold" />
              Elegir diseño y personalizar
            </Link>

            <span className="text-[11px] text-kc-mocha">
              o personalízalo desde el carrito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
