import Link from "next/link";
import { PackageOpen } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BoxBuilder from "@/components/box/BoxBuilder";
import type {
  GrupoRelleno,
  PresentacionSabor,
  Relleno,
} from "@/components/box/BoxBuilder";

import { createAdminClient } from "@/lib/supabase/admin";
import { CATALOGOS_CAJA } from "@/lib/box/caja.config";

export const revalidate = 600;

const SLUG_CAJA = "caja-personalizada";

export const metadata = {
  title: "Cajas de Bocaditos Dulces para Regalo y Eventos | Kelly's Cake Arequipa",
  description:
    "Arma tu caja personalizada de bocaditos dulces en Arequipa. Combina alfajores, brownies, trufas y mini postres artesanales con delivery directo.",
  keywords: [
    "cajas de bocaditos dulces arequipa",
    "bocaditos para regalo arequipa",
    "cajas dulces delivery arequipa",
    "mini postres artesanales arequipa",
    "bocaditos para eventos y cumpleaños",
  ],
  openGraph: {
    title: "Arma tu Caja de Bocaditos Dulces en Arequipa | Kelly's Cake",
    description:
      "Elige el tamaño y combina tus bocaditos favoritos recién horneados para regalar o compartir.",
    type: "website",
    locale: "es_PE",
  },
};

function extraerUnidades(nombre: string): number {
  return parseInt(nombre.match(/\d+/)?.[0] ?? "", 10);
}

export default async function ArmarCajaPage() {
  const supabase = createAdminClient();

  // 1) Producto contenedor de la caja (oculto de la tienda)
  const { data: caja } = await supabase
    .from("productos")
    .select("id")
    .eq("slug", SLUG_CAJA)
    .maybeSingle();

  if (!caja) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-kc-cream px-6 py-24">
          <div className="max-w-md rounded-3xl border border-kc-sand/60 bg-white p-10 text-center shadow-sm">
            <PackageOpen className="mx-auto h-12 w-12 text-kc-rose-gold" />
            <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-kc-charcoal">
              Muy pronto
            </h1>
            <p className="mt-2 text-sm text-kc-mocha">
              Estamos preparando esta sección. Vuelve en un rato.
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-block rounded-full bg-kc-charcoal px-7 py-2.5 text-sm font-medium text-kc-cream transition hover:bg-kc-deep"
            >
              Ir a la tienda
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 2) Catálogos de bocaditos y sus productos publicados
  const { data: catalogos } = await supabase
    .from("catalogo_personalizacion")
    .select("id, nombre")
    .in("nombre", CATALOGOS_CAJA)
    .eq("activo", true);

  const catalogoIds = (catalogos ?? []).map((c) => c.id as string);

  const grupos: GrupoRelleno[] = [];

  if (catalogoIds.length > 0) {
    const { data: productos } = await supabase
      .from("productos")
      .select(
        `
        id,
        nombre,
        catalogo_id,
        media:imagen_principal_id (url)
      `
      )
      .in("catalogo_id", catalogoIds)
      .eq("estado", "publicado")
      .neq("slug", SLUG_CAJA)
      .order("nombre");

    // 3) Presentaciones (precios por paquete: 6/12/18/24...) de todos los rellenos
    const productoIds = (productos ?? []).map((p) => p.id as string);

    let resPres = { data: null as {
      producto_id: string;
      nombre: string;
      precio: number;
      activo: boolean | null;
    }[] | null };

    if (productoIds.length > 0) {
      resPres = await supabase
        .from("producto_presentaciones")
        .select("producto_id, nombre, precio, activo")
        .in("producto_id", productoIds);
    }

    const presentacionesByProduct: Record<string, PresentacionSabor[]> = {};

    for (const p of resPres.data ?? []) {
      if (p.activo === false) continue;
      const pid = p.producto_id as string;
      const unidades = extraerUnidades(p.nombre as string);
      if (Number.isNaN(unidades) || unidades <= 0) continue;
      (presentacionesByProduct[pid] ??= []).push({
        unidades,
        precio: Number(p.precio),
      });
    }

    for (const pres of Object.values(presentacionesByProduct)) {
      pres.sort((a, b) => a.unidades - b.unidades);
    }

    const rellenosPorCatalogo = (productos ?? []).reduce<
      Record<string, Relleno[]>
    >((acc, p) => {
      const catId = p.catalogo_id as string | null;
      if (!catId) return acc;
      const media = Array.isArray(p.media)
        ? (p.media as Array<{ url: string }>)[0]
        : (p.media as { url: string } | null);
      const pid = p.id as string;
      acc[catId] ??= [];
      acc[catId].push({
        id: pid,
        nombre: p.nombre as string,
        imagen_url: media?.url ?? null,
        presentaciones: presentacionesByProduct[pid] ?? [],
      });
      return acc;
    }, {});

    // Un grupo es válido si tiene sabores con precios y tamaños disponibles
    for (const nombre of CATALOGOS_CAJA) {
      const catalogo = (catalogos ?? []).find(
        (c) =>
          (c.nombre as string).toLowerCase() === nombre.toLowerCase()
      );
      if (!catalogo) continue;

      const rellenos = rellenosPorCatalogo[catalogo.id as string] ?? [];
      if (rellenos.length === 0) continue;

      grupos.push({
        catalogoId: catalogo.id as string,
        catalogoNombre: catalogo.nombre as string,
        rellenos,
      });
    }
  }

  if (grupos.length === 0) {
    // Diagnóstico: ¿qué falta exactamente?
    const catalogosExistentes = new Set(
      (catalogos ?? []).map((c) => (c.nombre as string).toLowerCase())
    );
    const catalogosFaltantes = CATALOGOS_CAJA.filter(
      (n) => !catalogosExistentes.has(n.toLowerCase())
    );
    const catalogosSinProductos = CATALOGOS_CAJA.filter(
      (n) =>
        catalogosExistentes.has(n.toLowerCase()) &&
        !grupos.some(
          (g) => g.catalogoNombre.toLowerCase() === n.toLowerCase()
        )
    );

    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-kc-cream px-6 py-24">
          <div className="max-w-md rounded-3xl border border-kc-sand/60 bg-white p-10 text-center shadow-sm">
            <PackageOpen className="mx-auto h-12 w-12 text-kc-rose-gold" />
            <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-kc-charcoal">
              Caja no disponible
            </h1>
            <p className="mt-2 text-sm text-kc-mocha">
              Faltan bocaditos con precios para armar tu caja.
            </p>

            <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-kc-mocha">
              {catalogosFaltantes.length > 0 && (
                <li>
                  <strong className="text-kc-charcoal">
                    Catálogo(s) por crear:
                  </strong>{" "}
                  {catalogosFaltantes.join(", ")}. Créalos en Admin →
                  Catálogos.
                </li>
              )}
              {catalogosSinProductos.length > 0 && (
                <li>
                  <strong className="text-kc-charcoal">
                    Sin productos publicados con presentaciones:
                  </strong>{" "}
                  {catalogosSinProductos.join(
                    ", "
                  )}
                  . Publica al menos un producto y define sus presentaciones
                  (6, 12... unidades) en la pestaña Presentaciones.
                </li>
              )}
            </ul>

            <Link
              href="/productos"
              className="mt-6 inline-block rounded-full bg-kc-charcoal px-7 py-2.5 text-sm font-medium text-kc-cream transition hover:bg-kc-deep"
            >
              Ir a la tienda
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero compacto */}
      <section className="relative overflow-hidden bg-kc-charcoal pt-6 pb-12 text-center text-kc-cream lg:pt-8 lg:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-kc-rose-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-kc-blush/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl px-6">
          <p className="text-xs font-semibold tracking-[0.3em] text-kc-rose-gold uppercase">
            Exclusivo Kelly&apos;s Cake
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl font-semibold sm:text-5xl">
            Arma tu caja
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-kc-cream/80 sm:text-base">
            Elige el tipo de caja, combina tus bocaditos favoritos y cada sabor
            suma el precio de su paquete.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-kc-cream py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <BoxBuilder
            productoId={caja.id}
            grupos={grupos}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}