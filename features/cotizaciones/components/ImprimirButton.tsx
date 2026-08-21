"use client";

export default function ImprimirButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-kc-charcoal px-5 py-2.5 text-sm font-semibold text-kc-cream transition hover:bg-kc-deep"
    >
      🖨 Imprimir / PDF
    </button>
  );
}
