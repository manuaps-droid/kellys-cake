import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CatalogImageGallery from "@/features/admin/personalization/images/components/CatalogImageGallery";
import CatalogProductsGallery from "@/features/admin/personalization/images/components/CatalogProductsGallery";
import TopperPicker from "@/features/customization/components/TopperPicker";
import { TOPPER_CATALOGO_ID, TOPPER_PRODUCTO_SLUG } from "@/features/customization/constants/topper.constants";

import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 600;

export default async function CatalogDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: catalog } = await supabase
    .from("catalogo_personalizacion")
    .select("id, nombre, descripcion, tipo")
    .eq("id", id)
    .single();

  if (!catalog) notFound();

  const esTopper =
    catalog.id === TOPPER_CATALOGO_ID ||
    catalog.nombre.toLowerCase().includes("topper");

  if (esTopper) {
    redirect("/personalizar/topper");
  }

  // Producto con el que se cobra el topper (se resuelve en el servidor)
  let productoTopper: { id: string; precio: number | null } | null = null;

  if (esTopper) {
    const { data: p } = await supabase
      .from("productos")
      .select("id, precio")
      .eq("slug", TOPPER_PRODUCTO_SLUG)
      .eq("estado", "publicado")
      .maybeSingle();

    productoTopper = p ?? null;
  }

  // 1) Obtener imágenes del catálogo (catalogo_imagenes)
  const { data: rels } = await supabase
    .from("catalogo_imagenes")
    .select("id, media_id, orden, es_portada, precio, descripcion")
    .eq("catalogo_id", id)
    .order("orden");

  const mediaIds = (rels ?? []).map((r: Record<string, unknown>) => r.media_id as string);

  const { data: mediaData } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in("id", mediaIds.length > 0 ? mediaIds : ["00000000-0000-0000-0000-000000000000"]);

  const mediaMap = new Map(
    (mediaData ?? []).map((m: Record<string, unknown>) => [m.id as string, m])
  );

  const catalogImages = (rels ?? []).map((r: Record<string, unknown>) => {
    const media = mediaMap.get(r.media_id as string) as Record<string, unknown> | undefined;
    return {
      id: r.id as string,
      url: (media?.url as string) ?? "",
      nombre: (media?.nombre as string) ?? "",
      es_portada: r.es_portada as boolean ?? false,
      precio: (r.precio as number | null) ?? null,
      descripcion: (r.descripcion as string | null) ?? null,
    };
  });

  // Set de media_ids que ya están como portada en catalogo_imagenes
  const portadaMediaIds = new Set(
    (rels ?? [])
      .filter((r: Record<string, unknown>) => r.es_portada === true)
      .map((r: Record<string, unknown>) => r.media_id as string)
  );

  // 2) Obtener los productos del catálogo (con su imagen principal)
  const { data: productos } = await supabase
    .from("productos")
    .select(
      `
      id,
      nombre,
      imagen_principal_id
      `
    )
    .eq("catalogo_id", id)
    .eq("estado", "publicado")
    .order("created_at", { ascending: false });

  // Obtener las imágenes principales de los productos
  const productoMediaIds = (productos ?? [])
    .map((p: Record<string, unknown>) => p.imagen_principal_id as string | null)
    .filter((mid): mid is string => mid !== null);

  const { data: productoMediaData } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in("id", productoMediaIds.length > 0 ? productoMediaIds : ["00000000-0000-0000-0000-000000000000"]);

  const productoMediaMap = new Map(
    (productoMediaData ?? []).map((m: Record<string, unknown>) => [m.id as string, m])
  );

  const productosConImagen = (productos ?? []).map((p: Record<string, unknown>) => {
    const mediaId = p.imagen_principal_id as string | null;
    const media = mediaId ? productoMediaMap.get(mediaId) as Record<string, unknown> | undefined : undefined;
    return {
      producto_id: p.id as string,
      producto_nombre: p.nombre as string,
      media_id: mediaId ?? "",
      url: (media?.url as string) ?? "",
      nombre: (media?.nombre as string) ?? "",
      es_portada: mediaId ? portadaMediaIds.has(mediaId) : false,
    };
  }).filter((p) => p.media_id !== "");

  // 3) Si no hay productos directos, buscar también en producto_catalogo (relación muchos a muchos)
  let productosParaMostrar = productosConImagen;
  if (productosParaMostrar.length === 0) {
    const { data: productoCatalogoRels } = await supabase
      .from("producto_catalogo")
      .select("producto_id")
      .eq("catalogo_id", id)
      .order("orden");

    const productoIds = (productoCatalogoRels ?? []).map(
      (r: Record<string, unknown>) => r.producto_id as string
    );

    if (productoIds.length > 0) {
      const { data: productosMM } = await supabase
        .from("productos")
        .select("id, nombre, imagen_principal_id")
        .in("id", productoIds)
        .eq("estado", "publicado")
        .order("created_at", { ascending: false });

      const mmMediaIds = (productosMM ?? [])
        .map((p: Record<string, unknown>) => p.imagen_principal_id as string | null)
        .filter((mid): mid is string => mid !== null);

      const { data: mmMediaData } = await supabase
        .from("media")
        .select("id, url, nombre")
        .in("id", mmMediaIds.length > 0 ? mmMediaIds : ["00000000-0000-0000-0000-000000000000"]);

      const mmMediaMap = new Map(
        (mmMediaData ?? []).map((m: Record<string, unknown>) => [m.id as string, m])
      );

      productosParaMostrar = (productosMM ?? []).map((p: Record<string, unknown>) => {
        const mediaId = p.imagen_principal_id as string | null;
        const media = mediaId ? mmMediaMap.get(mediaId) as Record<string, unknown> | undefined : undefined;
        return {
          producto_id: p.id as string,
          producto_nombre: p.nombre as string,
          media_id: mediaId ?? "",
          url: (media?.url as string) ?? "",
          nombre: (media?.nombre as string) ?? "",
          es_portada: mediaId ? portadaMediaIds.has(mediaId) : false,
        };
      }).filter((p) => p.media_id !== "");
    }
  }

  const disenosTopper = catalogImages
    .filter((d) => d.url !== "")
    .map((d) => ({
      id: d.id,
      url: d.url,
      nombre: d.nombre,
      precio: d.precio,
    }));

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero del catálogo */}
        <section className="relative bg-kc-charcoal py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-semibold text-kc-cream lg:text-6xl">
              {catalog.nombre}
            </h1>
            {catalog.descripcion && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-kc-blush">
                {catalog.descripcion}
              </p>
            )}
          </div>
        </section>

        {esTopper ? (
          productoTopper && (
            <TopperPicker
              productoId={productoTopper.id}
              precioBase={productoTopper.precio ?? 15}
              disenos={disenosTopper}
            />
          )
        ) : (
          <>
            <p className="text-kc-mocha text-sm mb-4">Imágenes referenciales</p>

            {/* Productos del catálogo con checkboxes de portada */}
            {productosParaMostrar.length > 0 && (
              <CatalogProductsGallery
                productos={productosParaMostrar}
                catalogoId={id}
              />
            )}

            {/* Galería de imágenes del catálogo (con opción de portada/eliminar) */}
            {(productosParaMostrar.length === 0 && catalogImages.length === 0) && (
              <section className="bg-kc-cream py-16">
                <div className="mx-auto max-w-7xl px-6">
                  <div className="rounded-xl border border-dashed p-12 text-center text-gray-500">
                    No hay productos ni imágenes disponibles para este catálogo todavía.
                  </div>
                </div>
              </section>
            )}

            <CatalogImageGallery catalogImages={catalogImages} catalogoId={id} />

            {/* CTA */}
            <section className="bg-kc-ivory py-16 text-center">
              <div className="mx-auto max-w-3xl px-6">
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold text-kc-charcoal">
                  ¿Te gustó lo que viste?
                </h2>
                <p className="mt-3 text-kc-mocha">
                  Personaliza tu propio pastel inspirado en esta colección.
                </p>
                <Link
                  href="/personalizar"
                  className="mt-8 inline-flex rounded-full bg-kc-charcoal px-8 py-4 text-sm font-medium text-kc-cream transition hover:bg-kc-deep"
                >
                  Personalizar mi pastel
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
