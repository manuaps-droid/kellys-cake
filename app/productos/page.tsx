import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CakeSlice, Sparkles, Truck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CatalogosGrid from "@/components/CatalogosGrid";
import ProductosGrid from "@/components/ProductosGrid";
import TopperPicker from "@/features/customization/components/TopperPicker";
import { TOPPER_CATALOGO_ID } from "@/features/customization/constants/topper.constants";
import { getTopperInfo } from "@/features/customization/services/topper-disenos.service";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicMarketing } from "@/features/admin/configuracion/queries/public-config.query";
import BannerServiciosEspeciales from "@/components/productos/BannerServiciosEspeciales";

export const metadata: Metadata = {
  title: "Tienda Online | Catálogo de Tortas y Postres con Delivery en Arequipa",
  description:
    "Comprar tortas online en Arequipa. Catálogo artesanal de tortas de cumpleaños, kekes, bocaditos dulces y pastelería fina con entrega a domicilio.",
  keywords: [
    "comprar torta online arequipa",
    "catalogo de tortas arequipa",
    "tortas delivery arequipa",
    "tortas de cumpleaños arequipa",
    "pastelería fina delivery",
    "bocaditos dulces a domicilio",
  ],
  openGraph: {
    title: "Tienda Online de Tortas y Postres en Arequipa | Kelly's Cake",
    description:
      "Explora nuestro catálogo y pide online tus pasteles y bocaditos frescos con entrega puntual en Arequipa.",
    type: "website",
    locale: "es_PE",
  },
};

export const revalidate = 600;

type CatalogRow = { id: string; nombre: string; tipo: string };
type ProductRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number | null;
  mas_vendido: boolean | null;
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

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ catalogo?: string }>;
}) {
  const { catalogo: catalogoSeleccionado } = await searchParams;
  const supabase = createAdminClient();
  const marketingCfg = await getPublicMarketing();

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

  // 2) Todas las imágenes de catálogo (para contar items y para portadas)
  const { data: catalogoImagenes } = await supabase
    .from("catalogo_imagenes")
    .select("catalogo_id, media_id, es_portada")
    .in("catalogo_id", catalogIds);

  // Portadas (media_id con es_portada=true)
  const portadaRels = (catalogoImagenes ?? []).filter((r) => r.es_portada === true);

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

  // Conteo de items (catalogo_imagenes) por catálogo — útil para toppers mostrar diseños
  const imagenesByCatalog = new Map<string, number>();
  for (const r of catalogoImagenes ?? []) {
    imagenesByCatalog.set(
      r.catalogo_id as string,
      (imagenesByCatalog.get(r.catalogo_id as string) ?? 0) + 1
    );
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
      mas_vendido,
      catalogo_id,
      media:imagen_principal_id (url)
    `
    )
    .in("catalogo_id", catalogIds)
    .eq("estado", "publicado")
    .order("created_at", { ascending: false });

  // 4) Obtener tiers de precios por cantidad y presentaciones (para coffee_break)
  const productoIds = (products ?? []).map((p) => p.id as string);
  const tiersByProduct: Record<string, TierRow[]> = {};
  const presByProduct: Record<string, PresentacionRow[]> = {};
  const imagenSecundariaByProduct: Record<string, string> = {};

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

    // Imágenes secundarias para hover-swap (primera no-principal por producto)
    const { data: imgData } = await supabase
      .from("producto_imagenes")
      .select("producto_id, principal, media:media_id (url)")
      .in("producto_id", productoIds)
      .order("orden", { ascending: true });

    for (const row of (imgData ?? []) as Array<{
      producto_id: string;
      principal: boolean | null;
      media: { url: string } | { url: string }[] | null;
    }>) {
      // Saltar la principal; tomar la primera secundaria
      if (row.principal) continue;
      if (imagenSecundariaByProduct[row.producto_id]) continue;
      const m = Array.isArray(row.media)
        ? row.media[0]
        : row.media;
      if (m?.url) imagenSecundariaByProduct[row.producto_id] = m.url;
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
        mas_vendido: p.mas_vendido ?? false,
        imagen_url: media?.url ?? null,
        imagen_url_2: imagenSecundariaByProduct[p.id] ?? null,
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

  // 7) Vista según parámetro: catálogo seleccionado o cuadrícula de catálogos
  const seleccionado = catalogoSeleccionado
    ? catalogosParaAccordion.find((c) => c.id === catalogoSeleccionado)
    : undefined;

  if (seleccionado) {
    const esTopper =
      seleccionado.id === TOPPER_CATALOGO_ID ||
      seleccionado.nombre.toLowerCase().includes("topper");

    if (esTopper) {
      redirect("/personalizar/topper");
    }

    return (
      <>
        <Navbar />
        <main className="flex-1 bg-kc-cream">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
            <ProductosGrid
              catalogo={seleccionado}
              productos={seleccionado.productos}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Sin selección: solo catálogos con al menos un producto publicado (o topper con diseños)
  const catalogosConProductos = catalogosParaAccordion.filter(
    (c) =>
      c.productos.length > 0 ||
      (c.id === TOPPER_CATALOGO_ID && (imagenesByCatalog.get(c.id) ?? 0) > 0)
  );

  if (catalogosConProductos.length === 0) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-kc-cream py-24 text-center">
          <p className="text-gray-500">
            No hay productos disponibles por ahora.
          </p>
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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <BannerServiciosEspeciales>
            <div className="relative mx-auto max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.3em] text-kc-rose-gold uppercase">
                Repostería artesanal
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold sm:text-5xl">
                Tienda Online
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-kc-cream/80 sm:text-base">
                Pasteles, kekes y bocaditos que preparamos el mismo día, con buenos
                ingredientes. Elige los tuyos y los recibes frescos en tu puerta.
              </p>

              {/* Barra de confianza */}
              <ul className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-kc-cream/90">
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
                  Ingredientes de calidad
                </li>
              </ul>
            </div>
          </BannerServiciosEspeciales>
        </div>
      </section>

      <main className="flex-1 bg-kc-cream py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Encabezado de la sección */}
          <div className="mb-10 text-center">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-kc-charcoal sm:text-4xl">
              Explora por catálogo
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-kc-mocha">
              Elige una categoría para ver todos sus productos.
            </p>
          </div>

          <CatalogosGrid
            posicionCaja={(marketingCfg as any)?.posicion_arma_caja ?? 0}
            catalogos={catalogosConProductos.map((c) => {
              const cantidadImagenes = imagenesByCatalog.get(c.id) ?? 0;
              const esTopper =
                c.id === TOPPER_CATALOGO_ID ||
                c.nombre.toLowerCase().includes("topper");
              // Para el catálogo de toppers, el "producto" es cada diseño; mostramos su cantidad.
              return {
                id: c.id,
                nombre: c.nombre,
                tipo: c.tipo,
                portada_url: c.portada_url,
                cantidad: esTopper && cantidadImagenes > 0 ? cantidadImagenes : c.productos.length,
                href: esTopper ? "/personalizar/topper" : `/productos?catalogo=${c.id}`,
              };
            })}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
