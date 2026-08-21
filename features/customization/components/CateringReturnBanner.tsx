"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CateringReturnBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.location.search.includes("from=catering")) {
        setVisible(true);
      }
    } catch { /* ignore */ }
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-kc-rose-gold/30 bg-kc-rose-gold/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <p className="text-sm text-kc-charcoal">
          🍰 Estás diseñando un pastel para adjuntarlo a tu solicitud de catering. Al terminar, volverás automáticamente al formulario.
        </p>
        <Link
          href="/catering#cotizar"
          className="shrink-0 rounded-full border border-kc-sand bg-white px-4 py-1.5 text-xs font-semibold text-kc-charcoal transition hover:bg-kc-sand/40"
        >
          Cancelar y volver a catering
        </Link>
      </div>
    </div>
  );
}
