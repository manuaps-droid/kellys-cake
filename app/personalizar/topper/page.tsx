import type { Metadata } from "next";
import { notFound } from "next/navigation";

import TopperPicker from "@/features/customization/components/TopperPicker";
import {
  TOPPER_CATALOGO_ID,
  TOPPER_PRODUCTO_SLUG,
} from "@/features/customization/constants/topper.constants";

import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Toppers Personalizados en Impresión 3D para Tortas | Kelly's Cake",
  description:
    "Diseña y personaliza tu topper en impresión 3D con nombre o mensaje especial para coronar tu pastel. Fabricación de alta precisión en Arequipa.",
  keywords: [
    "toppers personalizados 3d arequipa",
    "topper para torta impresion 3d",
    "cake topper feliz cumpleaños personalizado",
    "toppers con nombre para pastel",
    "toppers tematicos 3d arequipa",
  ],
  openGraph: {
    title: "Toppers Personalizados en Impresión 3D | Kelly's Cake Arequipa",
    description:
      "El toque final para tu pastel: toppers personalizados elaborados en impresión 3D de alta definición.",
    type: "website",
    locale: "es_PE",
  },
};

export const revalidate = 600;

export default async function DisenarTopperPage() {
  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("id, nombre, precio")
    .eq("slug", TOPPER_PRODUCTO_SLUG)
    .eq("estado", "publicado")
    .maybeSingle();

  if (!producto) notFound();

  const productoId = producto.id as string;
  const precioBase =
    producto.precio != null ? Number(producto.precio) : 16.99;

  const { data: rels } = await supabase
    .from("catalogo_imagenes")
    .select("id, media_id, precio, descripcion")
    .eq("catalogo_id", TOPPER_CATALOGO_ID)
    .order("orden");

  const mediaIds = (rels ?? []).map((r: Record<string, unknown>) =>
    r.media_id as string
  );

  const { data: mediaData } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in(
      "id",
      mediaIds.length > 0
        ? mediaIds
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const mediaMap = new Map(
    (mediaData ?? []).map((m: Record<string, unknown>) => [
      m.id as string,
      m,
    ])
  );

  const disenos = (rels ?? []).map((r: Record<string, unknown>) => {
    const media = mediaMap.get(
      r.media_id as string
    ) as Record<string, unknown> | undefined;
    return {
      id: r.id as string,
      url: (media?.url as string) ?? "",
      nombre: (media?.nombre as string) ?? "Diseño",
      precio: r.precio != null ? Number(r.precio) : null,
    };
  }).filter((d) => d.url !== "");

  return (
    <div className="flex-1 bg-kc-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-kc-charcoal py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-kc-rose-gold uppercase">
              Kelly&apos;s Cake · Toppers en Impresión 3D
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-5xl font-semibold text-kc-cream lg:text-6xl">
              Diseña tu topper
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-kc-blush">
              Escoge el diseño que más te guste, escribe el nombre y nosotros lo
              fabricamos en impresión 3D listo para coronar tu pastel.
            </p>
          </div>
        </section>

        {/* Pasos rápidos */}
        <section className="border-b border-kc-sand bg-kc-ivory">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Elige tu diseño",
                  d: "Escoge el modelo que más combine con tu temática.",
                },
                {
                  n: "02",
                  t: "Escribe el nombre",
                  d: "Indica el nombre o frase corta para personalizar la pieza.",
                },
                {
                  n: "03",
                  t: "Fabricación 3D",
                  d: "Agrégalo al carrito y lo elaboramos en impresión 3D para tu pastel.",
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-rose-gold">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-kc-charcoal uppercase">
                      {s.t}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-kc-mocha">
                      {s.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diseñador */}
        <section className="bg-kc-cream py-16">
          <div className="mx-auto max-w-7xl px-6">
            <TopperPicker
              productoId={productoId}
              precioBase={precioBase}
              disenos={disenos}
            />
          </div>
        </section>

        {/* Nota final */}
        <section className="bg-kc-ivory pb-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm leading-relaxed text-kc-mocha">
              ¿Dudas con medidas o colores? Escríbenos y te asesoramos al instante.
              Cada topper se elabora en impresión 3D con materiales seguros y resistentes para tu celebración.
            </p>
          </div>
        </section>
    </div>
  );
}