import { createAdminClient } from "@/lib/supabase/admin";

export type CatalogoTiendaItem = {
  id: string;
  url: string;
  nombre: string;
  precio: number | null;
  descripcion: string | null;
};

export type CatalogoTienda = {
  id: string;
  nombre: string;
  items: CatalogoTiendaItem[];
};

/**
 * Catálogos de la tienda online (los mismos que ven los clientes)
 * para usarlos como origen al crear productos en FoodOS.
 */
export async function getCatalogosTienda(): Promise<
  CatalogoTienda[]
> {
  const supabase = createAdminClient();

  const { data: catalogos } = await supabase
    .from("catalogo_personalizacion")
    .select("id, nombre")
    .order("nombre");

  if (!catalogos || catalogos.length === 0) return [];

  const ids = catalogos.map(
    (c: { id: string }) => c.id as string
  );

  const { data: rels } = await supabase
    .from("catalogo_imagenes")
    .select(
      "id, catalogo_id, media_id, precio, descripcion, orden"
    )
    .in("catalogo_id", ids)
    .order("orden");

  const mediaIds = ((rels ?? []) as Array<{ media_id: string }>)
    .map((r) => r.media_id)
    .filter(Boolean);

  const { data: medias } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in(
      "id",
      mediaIds.length > 0
        ? mediaIds
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const mediaMap = new Map(
    ((medias ?? []) as Array<{
      id: string;
      url: string;
      nombre: string;
    }>).map((m) => [m.id, m])
  );

  return catalogos.map(
    (c: { id: string; nombre: string }) => ({
      id: c.id,
      nombre: c.nombre,
      items: ((rels ?? []) as Array<{
        id: string;
        catalogo_id: string;
        media_id: string;
        precio: number | null;
        descripcion: string | null;
      }>)
        .filter((r) => r.catalogo_id === c.id)
        .map((r) => {
          const media = mediaMap.get(r.media_id);

          return {
            id: r.id,
            url: media?.url ?? "",
            nombre: media?.nombre ?? "Diseño",
            precio:
              r.precio != null ? Number(r.precio) : null,
            descripcion: r.descripcion ?? null,
          };
        })
        .filter((i) => i.url !== ""),
    })
  );
}
