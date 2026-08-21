import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CakeSlice, Clock, Sparkles, Truck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import PrecioCantidadDropdown from "@/components/PrecioCantidadDropdown";

import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 600;

type ProductRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number | null;
  disponible: boolean | null;
  media: { url: string } | { url: string }[] | null;
};

const BENEFICIOS = [
  { icon: CakeSlice, texto: "Hecho a mano, diario" },
  { icon: Sparkles, texto: "Ingredientes premium" },
  { icon: Truck, texto: "Delivery en Arequipa" },
  { icon: Clock, texto: "Pedidos con 24h de anticipación" },
];

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("productos")
    .select(
      `
      id,
      nombre,
      slug,
      descripcion_corta,
      descripcion,
      precio,
      disponible,
      media:imagen_principal_id (url)
    `
    )
    .eq("slug", slug)
    .eq("estado", "publicado")
    .maybeSingle();

  const product = data as ProductRow | null;

  if (!product) {
    notFound();
  }

  const media = Array.isArray(product.media)
    ? (product.media as Array<{ url: string }>)[0]
    : (product.media as { url: string } | null);
  const imagenUrl = media?.url ?? null;

  // Presentaciones del producto (venta mínima / coffee break)
  const { data: presData } = await supabase
    .from("producto_presentaciones")
    .select("id, nombre, precio, orden, activo")
    .eq("producto_id", product.id)
    .order("orden", { ascending: true });

  const presentaciones = (presData ?? [])
    .filter((p) => p.activo !== false)
    .map((p) => ({
      id: p.id as string,
      nombre: p.nombre as string,
      precio: Number(p.precio),
    }));

  const descripcionCorta = product.descripcion_corta?.trim() || null;
  const descripcionLarga = product.descripcion?.trim() || null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-kc-cream">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs tracking-wide text-kc-mocha">
            <Link href="/" className="transition-colors hover:text-kc-rose-gold">
              Inicio
            </Link>
            <span className="text-kc-sand">/</span>
            <Link
              href="/productos"
              className="transition-colors hover:text-kc-rose-gold"
            >
              Tienda Online
            </Link>
            <span className="text-kc-sand">/</span>
            <span className="truncate font-medium text-kc-charcoal">
              {product.nombre}
            </span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Imagen */}
            <div className="lg:sticky lg:top-24">
              <div className="group relative aspect-square overflow-hidden rounded-3xl border border-kc-sand/50 bg-white shadow-[0_20px_50px_-20px_rgba(44,24,16,0.25)] transition-shadow duration-500 hover:shadow-[0_30px_70px_-20px_rgba(44,24,16,0.35)]">
                {imagenUrl ? (
                  <Image
                    src={imagenUrl}
                    alt={product.nombre}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-110"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-7xl transition-transform duration-700 ease-out group-hover:scale-110">
                    🍰
                  </div>
                )}

                {/* Badge imagen referencial */}
                {imagenUrl && (
                  <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-kc-charcoal/70 px-3 py-1 text-[11px] font-medium tracking-wide text-kc-cream backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-0">
                    Imagen referencial
                  </span>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="flex flex-col">
              <h1 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight font-semibold text-kc-charcoal sm:text-4xl">
                {product.nombre}
              </h1>

              {descripcionCorta && (
                <p className="mt-4 text-base leading-relaxed text-kc-mocha">
                  {descripcionCorta}
                </p>
              )}

              {/* Precio + CTA */}
              <div className="mt-8 border-t border-kc-sand/60 pt-8">
                {product.precio != null ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-xs font-medium tracking-widest text-kc-mocha uppercase">
                        Precio
                      </span>
                      <span className="text-sm text-kc-mocha">
                        · IGV incluido
                      </span>
                    </div>
                    <p className="mt-1 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kc-charcoal">
                      S/ {Number(product.precio).toFixed(2)}
                    </p>

                    <div className="mt-5 max-w-xs">
                      <AddToCartButton
                        productoId={product.id}
                        className="w-full rounded-full px-8 py-3 text-sm shadow-md shadow-kc-charcoal/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      />
                    </div>
                  </>
                ) : presentaciones.length > 0 ? (
                  <div className="max-w-xs">
                    <PrecioCantidadDropdown
                      productoId={product.id}
                      presentaciones={presentaciones}
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
                      Precio a consultar
                    </p>
                    <p className="mt-2 text-sm text-kc-mocha">
                      Cotizamos según tamaño, sabor y diseño.
                    </p>
                    <div className="mt-5">
                      <Link
                        href="/contacto"
                        className="inline-block rounded-full bg-kc-charcoal px-8 py-3 text-sm font-medium text-kc-cream transition-all duration-300 hover:-translate-y-0.5 hover:bg-kc-deep hover:shadow-lg hover:shadow-kc-charcoal/20"
                      >
                        Consultar por este producto
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Beneficios */}
              <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {BENEFICIOS.map(({ icon: Icon, texto }) => (
                  <li
                    key={texto}
                    className="flex items-center gap-2.5 text-sm text-kc-mocha"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kc-blush/40 text-kc-rose-gold">
                      <Icon className="h-4 w-4" />
                    </span>
                    {texto}
                  </li>
                ))}
              </ul>

              {/* Descripción larga */}
              {descripcionLarga && (
                <div className="mt-8 border-t border-kc-sand/60 pt-8">
                  <h2 className="text-xs font-semibold tracking-widest text-kc-charcoal uppercase">
                    Sobre este producto
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-kc-mocha">
                    {descripcionLarga}
                  </p>
                </div>
              )}

              <p className="mt-6 text-xs text-kc-mocha/80 italic">
                * El diseño final puede variar ligeramente, cada pastel es
                elaborado artesanalmente.
              </p>
            </div>
          </div>

          {/* Volver */}
          <div className="mt-14 border-t border-kc-sand/60 pt-6">
            <Link
              href="/productos"
              className="text-sm font-medium text-kc-rose-gold transition-colors hover:text-kc-charcoal"
            >
              ← Seguir viendo la tienda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
