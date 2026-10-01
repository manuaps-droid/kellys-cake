import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import AddToCartButton from "@/features/cart/components/AddToCartButton";
import PrecioCantidadDropdown from "@/components/PrecioCantidadDropdown";

export type Tier = {
  cantidad_minima: number;
  precio: number;
};

export type Presentacion = {
  id: string;
  nombre: string;
  precio: number;
};

export type ProductoCard = {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number | null;
  mas_vendido: boolean;
  imagen_url: string | null;
  imagen_url_2: string | null;
  tiers?: Tier[];
  presentaciones?: Presentacion[];
};

type Props = {
  product: ProductoCard;
};

export default function ProductCard({ product }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-kc-sand/50 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-kc-rose-gold/40 hover:shadow-[0_20px_45px_-15px_rgba(44,24,16,0.25)]">
      {/* Imagen */}
      <Link
        href={`/productos/${product.slug}`}
        className="group/img relative block aspect-square overflow-hidden bg-gray-100"
      >
        {product.imagen_url ? (
          <>
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-contain p-3 transition-all duration-700 ease-out group-hover:scale-110 ${
                product.imagen_url_2 ? "group-hover:opacity-0" : ""
              }`}
            />
            {product.imagen_url_2 && (
              <Image
                src={product.imagen_url_2}
                alt={`${product.nombre} - vista 2`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-3 opacity-0 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl transition-transform duration-700 group-hover:scale-110">
            🍰
          </div>
        )}

        {/* Badge "Más vendido" (esquina inferior izquierda) */}
        {product.mas_vendido && (
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-kc-rose-gold px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
            ★ Más vendido
          </span>
        )}

        {/* Badge imagen referencial (desaparece al hover) */}
        {product.imagen_url && (
          <span className="absolute right-2 top-2 rounded-full bg-kc-charcoal/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-kc-cream backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0">
            Imagen referencial
          </span>
        )}

        {/* Badge productos con presentación / venta mínima */}
        {((product.tiers?.length ?? 0) > 0 ||
          (product.presentaciones?.length ?? 0) > 0) && (
          <span className="absolute left-2 top-2 rounded-full bg-kc-rose-gold px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {(product.tiers?.length ?? 0) > 0
              ? `Desde ${Math.min(
                  ...product.tiers!.map((t) => t.cantidad_minima)
                )} und`
              : "Varias presentaciones"}
          </span>
        )}

        {/* Overlay CTA "Ver detalle" al hover */}
        <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1.5 bg-kc-charcoal/85 py-2.5 text-xs font-semibold tracking-wide text-kc-cream backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          Ver detalle
          <ArrowRight className="h-3.5 w-3.5" />
        </span>

        {/* Descripción sobre la imagen */}
        {(product.descripcion_corta || product.descripcion) && (
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-kc-charcoal/80 to-transparent p-3 text-left text-[11px] leading-snug text-white transition-opacity duration-300 group-hover:opacity-0">
            {product.descripcion_corta ?? product.descripcion}
          </span>
        )}
      </Link>

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="truncate font-semibold text-kc-charcoal transition-colors group-hover:text-kc-rose-gold">
            {product.nombre}
          </h3>
        </Link>

        {product.descripcion_corta && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-kc-mocha">
            {product.descripcion_corta}
          </p>
        )}

        {/* Precio + acciones */}
        <div className="mt-auto flex flex-col gap-3 pt-4">
          {(product.presentaciones?.length ?? 0) > 0 ||
          (product.tiers?.length ?? 0) > 0 ? (
            <PrecioCantidadDropdown
              productoId={product.id}
              presentaciones={product.presentaciones}
              tiers={product.tiers}
            />
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-semibold tracking-widest text-kc-mocha uppercase">
                  Precio
                </span>
                <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-kc-charcoal">
                  {product.precio != null
                    ? `S/ ${product.precio.toFixed(2)}`
                    : "Consultar"}
                </span>
              </div>

              {product.precio != null && (
                <AddToCartButton
                  productoId={product.id}
                  className="w-full rounded-full py-2.5 text-xs font-semibold shadow-sm transition-all duration-300 hover:shadow-md"
                />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
