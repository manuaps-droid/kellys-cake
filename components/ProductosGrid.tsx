import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProductCard, {
  type ProductoCard,
} from "@/components/ProductCard";

type Props = {
  catalogo: {
    id: string;
    nombre: string;
    tipo: string;
    portada_url: string | null;
  };
  productos: ProductoCard[];
};

export default function ProductosGrid({
  catalogo,
  productos,
}: Props) {
  return (
    <div>
      {/* Regreso a catálogos */}
      <Link
        href="/productos"
        className="inline-flex items-center gap-2 text-sm font-medium text-kc-mocha transition-colors hover:text-kc-rose-gold"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-kc-sand/70 bg-white transition-colors group-hover:border-kc-rose-gold/40">
          <ArrowLeft className="h-4 w-4" />
        </span>
        Ver todos los catálogos
      </Link>

      {/* Encabezado del catálogo */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-inner">
          {catalogo.portada_url ? (
            <Image
              src={catalogo.portada_url}
              alt={catalogo.nombre}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">
              🍰
            </div>
          )}
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-kc-charcoal sm:text-4xl">
            {catalogo.nombre}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-kc-blush/30 px-3 py-0.5 text-xs font-medium text-kc-mocha">
            {productos.length}{" "}
            {productos.length !== 1 ? "productos" : "producto"}
          </span>
        </div>
      </div>

      {/* Grid de productos */}
      {productos.length === 0 ? (
        <p className="py-20 text-center text-kc-mocha">
          No hay productos en este catálogo por ahora.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
