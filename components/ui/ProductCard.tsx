import Image from "next/image";

import AddToCartButton from "@/features/cart/components/AddToCartButton";

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  price: string | null;
  image: string;
  featured?: boolean;
};

export default function ProductCard({
  id,
  name,
  description,
  price,
  image,
  featured = false,
}: ProductCardProps) {
  const imageSrc =
    image && image.trim().length > 0
      ? image
      : "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNENUVCRTciLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+OmDwvdGV4dD48L3N2Zz4=";

  const hasPrice = price != null && price !== "Consultar";

  return (
    <div className="group overflow-hidden rounded-2xl border border-kc-sand/50 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badge imagen referencial */}
        {imageSrc && (
          <div className="absolute right-2 top-2 rounded-lg bg-kc-charcoal/90 px-2 py-1 text-xs font-semibold text-kc-cream backdrop-blur-sm">
            Imagen referencial
          </div>
        )}

        {/* Descripción del producto sobre la imagen */}
        {description && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-kc-charcoal/80 via-transparent backdrop-blur-sm text-xs">
            {description}
          </div>
        )}

        {featured && (
          <span className="absolute left-4 top-4 rounded-full bg-kc-charcoal/80 px-3 py-1 text-xs font-medium text-kc-cream backdrop-blur-sm">
            Destacado
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-kc-charcoal">
          {name}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-kc-mocha">
          {description}
        </p>

        {hasPrice && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-xl font-bold text-kc-rose-gold">{price}</span>

            <div className="w-44">
              <AddToCartButton productoId={id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
