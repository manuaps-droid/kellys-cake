import { CakeSlice, Sparkles, Truck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductosAccordion from "@/components/ProductosAccordion";

import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 600;

type CatalogRow = { id: string; nombre: string; tipo: string };
type ProductRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number | null;
  catalogo_id: string;
  media: { url: string } | { url: string }[] | null;
};
type TierRow = {
  producto_id: string;
  cantidad_minima: number;
  precio: number;
};
type PresentacionRow = {
  id: string;
  producto_id: string;
  nombre: string;
  precio: number;
  activo?: boolean | null;
};

export default async function ProductosPage() {
  const supabase = createAdminClient();

  // 1) Catálogos visibles en /productos (incluye categoria_producto y coffee_break)
  const { data: catalogs } = await supabase
    .from("catalogo_personalizacion")
    .select("id, nombre, tipo")
    .in("tipo", ["categoria_producto", "coffee_break"])
    .eq("activo", true)
    .eq("mostrar_en_productos", true)
    .order("orden");

  if (!catalogs || catalogs.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-kc-cream py-24 text-center">
          <p className="text-gray-500">No hay catálogos disponibles.</p>
        </main>
        <Footer />
      </>
    );
  }

  const catalogIds = (catalogs as CatalogRow[]).map((c) => c.id);

  // 2) Obtener foto de portada de cada catálogo (catalogo_imagenes con es_portada=true)
  const { data: portadaRels } = await supabase
    .from("catalogo_imagenes")
    .select("catalogo_id, media_id")
    .in("catalogo_id", catalogIds)
    .eq("es_portada", true);

  const portadaMediaIds = (portadaRels ?? []).map((r) => r.media_id as string);

  const { data: portadaMedia } = await supabase
    .from("media")
    .select("id, url")
    .in("id", portadaMediaIds.length > 0 ? portadaMediaIds : ["00000000-0000-0000-0000-000000000000"]);

  const portadaMap = new Map(
    (portadaMedia ?? []).map((m) => [m.id as string, m.url as string])
  );

  const portadaByCatalog = new Map<string, string | null>();
  for (const r of portadaRels ?? []) {
    portadaByCatalog.set(r.catalogo_id as string, portadaMap.get(r.media_id as string) ?? null);
  }

  // 3) Obtener productos de esos catálogos
  const { data: products } = await supabase
    .from("productos")
    .select(
      `
      id,
      nombre,
      slug,
      descripcion_corta,
      descripcion,
      precio,
      catalogo_id,
      media:imagen_principal_id (url)
    `
    )
    .in("catalogo_id", catalogIds)
    .eq("estado", "publicado")
    .order("created_at", { ascending: false });

  // 4) Obtener tiers de precios por cantidad y presentaciones (para coffee_break)
  const productoIds = (products ?? []).map((p) => p.id as string);
  let tiersByProduct: Record<string, TierRow[]> = {};
  let presByProduct: Record<string, PresentacionRow[]> = {};

  if (productoIds.length > 0) {
    const { data: tiersData } = await supabase
      .from("producto_precio_cantidad")
      .select("producto_id, cantidad_minima, precio")
      .in("producto_id", productoIds)
      .order("cantidad_minima", { ascending: true });

    for (const t of (tiersData ?? []) as TierRow[]) {
      if (!tiersByProduct[t.producto_id]) tiersByProduct[t.producto_id] = [];
      tiersByProduct[t.producto_id].push(t);
    }

    const { data: presData } = await supabase
      .from("producto_presentaciones")
      .select("id, producto_id, nombre, precio, orden, activo")
      .in("producto_id", productoIds)
      .order("orden", { ascending: true });

    for (const pr of (presData ?? []) as PresentacionRow[]) {
      if (pr.activo === false) continue;
      if (!presByProduct[pr.producto_id]) presByProduct[pr.producto_id] = [];
      presByProduct[pr.producto_id].push(pr);
    }
  }

  // 5) Agrupar productos por catalogo_id
  const productsByCatalog = new Map<string, ProductRow[]>();
  for (const p of (products ?? []) as ProductRow[]) {
    const arr = productsByCatalog.get(p.catalogo_id) ?? [];
    arr.push(p);
    productsByCatalog.set(p.catalogo_id, arr);
  }

  // 6) Construir datos para el componente acordeón
  const catalogosParaAccordion = (catalogs as CatalogRow[]).map((cat) => {
    const productsRaw = productsByCatalog.get(cat.id) ?? [];
    const productos = productsRaw.map((p) => {
      const media = Array.isArray(p.media)
        ? (p.media as Array<{ url: string }>)[0]
        : (p.media as { url: string } | null);
      const tiers = tiersByProduct[p.id] ?? [];

      return {
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        descripcion_corta: p.descripcion_corta ?? null,
        descripcion: p.descripcion ?? null,
        precio: p.precio,
        imagen_url: media?.url ?? null,
        tiers: tiers.map((t) => ({
          cantidad_minima: t.cantidad_minima,
          precio: t.precio,
        })),
        presentaciones: (presByProduct[p.id] ?? []).map((pr) => ({
          id: pr.id,
          nombre: pr.nombre,
          precio: pr.precio,
        })),
      };
    });

    return {
      id: cat.id,
      nombre: cat.nombre,
      tipo: cat.tipo,
      portada_url: portadaByCatalog.get(cat.id) ?? null,
      productos,
    };
  });

  if (catalogosParaAccordion.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-kc-cream py-24 text-center">
          <p className="text-gray-500">No hay catálogos disponibles.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Hero de tienda */}
      <section className="relative overflow-hidden bg-kc-charcoal py-16 text-center text-kc-cream lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-kc-rose-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-kc-blush/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="text-xs font-semibold tracking-[0.3em] text-kc-rose-gold uppercase">
            Repostería artesanal
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold sm:text-5xl">
            Tienda Online
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-kc-cream/80 sm:text-base">
            Pasteles, kekes y bocaditos elaborados diariamente con ingredientes
            premium. Elige tus favoritos y te los llevamos frescos a la puerta
            de tu casa.
          </p>

          {/* Barra de confianza */}
          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-kc-cream/90">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-kc-rose-gold" />
              Delivery en Arequipa
            </li>
            <li className="flex items-center gap-2">
              <CakeSlice className="h-4 w-4 text-kc-rose-gold" />
              Hecho a mano cada día
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-kc-rose-gold" />
              Ingredientes premium
            </li>
          </ul>
        </div>
      </section>

      <main className="flex-1 bg-kc-cream py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <ProductosAccordion catalogos={catalogosParaAccordion} />
        </div>
      </main>
      <Footer />
    </>
  );
}
