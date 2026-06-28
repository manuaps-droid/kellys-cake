import { products } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";

export default function FeaturedProducts() {
  return (
    <section className="bg-[#FFF8F2] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Nuestros Pasteles Destacados"
          subtitle="Los favoritos de nuestros clientes."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}