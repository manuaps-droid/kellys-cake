import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import type { ReactNode } from "react";

import { TOPPER_CATALOGO_ID } from "@/features/customization/constants/topper.constants";

export type CatalogoCard = {
  id: string;
  nombre: string;
  tipo: string;
  portada_url: string | null;
  cantidad: number;
  href?: string;
};

type Props = {
  catalogos: CatalogoCard[];
  /**
   * Posición (0-index) donde se inserta el cuadro destacado
   * "Arma tu caja" dentro de la grilla. Null/undefined = primero.
   */
  posicionCaja?: number | null;
};

function CuadroArmaTuCaja() {
  return (
    <Link
      href="/armar-caja"
      aria-label="Arma tu caja de bocaditos"
      className="group relative block overflow-hidden rounded-3xl border border-kc-charcoal bg-kc-charcoal shadow-[0_10px_40px_-15px_rgba(44,24,16,0.35)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_-20px_rgba(44,24,16,0.5)]"
    >
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-kc-rose-gold/30 blur-3xl transition-all duration-700 group-hover:bg-kc-rose-gold/50"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-14 h-56 w-56 rounded-full bg-kc-blush/20 blur-3xl"
      />

      <div className="relative flex aspect-[4/3] flex-col justify-between p-6 text-left">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold tracking-[0.3em] text-kc-rose-gold uppercase">
            Exclusivo
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-kc-rose-gold/15 text-kc-rose-gold ring-1 ring-kc-rose-gold/40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Gift className="h-6 w-6" />
          </span>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white sm:text-3xl">
            Arma tu caja
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-kc-cream/70">
            Elige el tamaño y combina tus bocaditos favoritos.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-kc-rose-gold uppercase transition-all duration-300 group-hover:translate-x-1">
            Personalizar
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CatalogosGrid({
  catalogos,
  posicionCaja,
}: Props) {
  const nodos: ReactNode[] = catalogos.map((catalogo, index) => {
    const esTopper =
      catalogo.id === TOPPER_CATALOGO_ID ||
      catalogo.nombre.toLowerCase().includes("topper");
    const href =
      catalogo.href ??
      (esTopper ? "/personalizar/topper" : `/productos?catalogo=${catalogo.id}`);
    const ctaText = esTopper ? "Personalizar topper" : "Ver productos";

    return (
      <Link
        key={catalogo.id}
        href={href}
        className="group relative block overflow-hidden rounded-3xl border border-kc-sand/50 bg-white shadow-[0_10px_40px_-15px_rgba(44,24,16,0.12)] transition-all duration-500 hover:-translate-y-2 hover:border-kc-rose-gold/40 hover:shadow-[0_25px_60px_-20px_rgba(44,24,16,0.3)]"
      >
        {/* Imagen de portada */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {catalogo.portada_url ? (
            <Image
              src={catalogo.portada_url}
              alt={catalogo.nombre}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              priority={index < 3}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-kc-blush/30 to-kc-cream text-5xl transition-transform duration-700 group-hover:scale-110">
              🍰
            </div>
          )}

          {/* Degradado para legibilidad del texto */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-kc-charcoal/80 via-kc-charcoal/10 to-transparent"
          />

          {/* Contador de productos */}
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-kc-charcoal backdrop-blur-sm transition-colors duration-300 group-hover:bg-kc-rose-gold group-hover:text-white">
            {catalogo.cantidad}{" "}
            {catalogo.cantidad !== 1 ? "productos" : "producto"}
          </span>

          {/* Nombre + CTA */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white drop-shadow-sm">
              {catalogo.nombre}
            </h2>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-kc-rose-gold uppercase opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  });

  // Insertar el cuadro destacado en la posición configurada
  const pos = Math.min(
    Math.max(posicionCaja ?? 0, 0),
    nodos.length
  );
  nodos.splice(pos, 0, <CuadroArmaTuCaja key="__arma_tu_caja__" />);

  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{nodos}</div>;
}
