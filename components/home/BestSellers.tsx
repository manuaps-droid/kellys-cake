import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";

import { getProducts } from "@/features/admin/products/services/product.service";

export default async function BestSellers() {
  const products = await getProducts("mas_vendido");

  if (products.length === 0) return null;

  return (
    <section className="bg-kc-cream py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Los Más Vendidos"
          subtitle="Los preferidos por nuestras familias arequipeñas."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const media = Array.isArray((product as Record<string, unknown>).media)
              ? ((product as Record<string, unknown>).media as Array<Record<string, unknown>>)[0]
              : ((product as Record<string, unknown>).media as Record<string, unknown> | null);

            const imageUrl = (media?.url as string) ?? "";

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.nombre}
                description={product.descripcion ?? ""}
                price={product.precio != null ? `S/ ${Number(product.precio).toFixed(2)}` : null}
                image={imageUrl}
                featured={false}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
