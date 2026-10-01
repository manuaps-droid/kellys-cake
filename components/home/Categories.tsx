import Image from "next/image";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";

import { createClient } from "@/lib/supabase/server";

type CategoryCard = {
  id: string;
  title: string;
  image: string;
  href: string;
};

export default async function Categories() {
  const supabase = await createClient();

  const { data: catalogs } = await supabase
    .from("catalogo_personalizacion")
    .select("id, nombre")
    .eq("tipo", "celebration")
    .eq("activo", true)
    .eq("mostrar_en_categorias", true)
    .order("orden");

  if (!catalogs || catalogs.length === 0) {
    return null;
  }

  const defaultImages = [
    "/images/categories/birthday.jpg",
    "/images/categories/wedding.jpg",
    "/images/categories/beer.jpg",
  ];

  // Intentar cargar la primera imagen de cada catálogo
  const categories: CategoryCard[] = await Promise.all(
    catalogs.map(async (cat, index) => {
      const { data: imgData } = await supabase
        .from("catalogo_imagenes")
        .select("media:media_id ( url )")
        .eq("catalogo_id", cat.id)
        .order("es_portada", { ascending: false })
        .order("orden")
        .limit(1);

      const media = imgData?.[0]?.media;
      const url = Array.isArray(media)
        ? (media[0] as Record<string, unknown>)?.url
        : (media as unknown as Record<string, unknown>)?.url;

      return {
        id: cat.id,
        title: cat.nombre,
        image: (url as string) ?? defaultImages[index % defaultImages.length],
        href: `/catalogos/${cat.id}`,
      };
    })
  );

  if (categories.length === 0) {
    return null;
  }

  return <CategoryGrid categories={categories} />;
}

function CategoryGrid({ categories }: { categories: CategoryCard[] }) {
  return (
    <section className="bg-kc-ivory py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Cada celebración merece su propia pieza"
          subtitle="Diseños de autor pensados para la ocasión que estás planeando."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-80">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kc-charcoal/70 via-kc-charcoal/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white">
                  {category.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-kc-blush transition-colors group-hover:text-white">
                  Ver colección
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
