import type { MetadataRoute } from "next";

import { createAdminClient } from "@/lib/supabase/admin";
import { TOPPER_CATALOGO_ID } from "@/features/customization/constants/topper.constants";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kellyscake.pe";

export const revalidate = 3600;

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const supabase = createAdminClient();
  const ahora = new Date();

  const estaticasBase = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/personalizar`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/personalizar/topper`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/armar-caja`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/area-pets`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/catering`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/nosotros`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contacto`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/descargar-app`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/libro-de-reclamaciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terminos-y-condiciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-de-envio`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-de-cambios-y-devoluciones`, changeFrequency: "yearly", priority: 0.3 },
  ] as const;

  const estaticas: MetadataRoute.Sitemap = estaticasBase.map(
    (entrada) => ({ ...entrada, lastModified: ahora })
  );

  const { data: productos } = await supabase
    .from("productos")
    .select("slug, updated_at")
    .eq("estado", "publicado")
    .order("created_at", { ascending: false })
    .limit(500);

  const productoEntries: MetadataRoute.Sitemap = (
    productos ?? []
  ).map((p) => ({
    url: `${BASE_URL}/productos/${p.slug}`,
    lastModified: new Date(p.updated_at ?? ahora),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const { data: catalogos } = await supabase
    .from("catalogo_personalizacion")
    .select("id, updated_at")
    .neq("id", TOPPER_CATALOGO_ID);

  const catalogoEntries: MetadataRoute.Sitemap = (
    catalogos ?? []
  ).map((c) => ({
    url: `${BASE_URL}/catalogos/${c.id}`,
    lastModified: new Date(c.updated_at ?? ahora),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...estaticas, ...productoEntries, ...catalogoEntries];
}
