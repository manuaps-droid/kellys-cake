import { createAdminClient } from "@/lib/supabase/admin";

export type CatalogImageRow = {
  id: string;
  catalogo_id: string;
  media_id: string;
  orden: number;
  label: string | null;
  es_portada: boolean;
  url: string;
  nombre: string;
};

export async function getCatalogImagesRepository(
  catalogoId: string
): Promise<CatalogImageRow[]> {
  const supabase = createAdminClient();

  const { data: rels, error: relError } = await supabase
    .from("catalogo_imagenes")
    .select("id, catalogo_id, media_id, orden, label, es_portada")
    .eq("catalogo_id", catalogoId)
    .order("orden");

  if (relError) throw relError;
  if (!rels || rels.length === 0) return [];

  const mediaIds = rels.map((r) => r.media_id);

  const { data: mediaData, error: mediaError } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in("id", mediaIds);

  if (mediaError) throw mediaError;

  const mediaMap = new Map(
    (mediaData ?? []).map((m: Record<string, unknown>) => [
      m.id as string,
      m,
    ])
  );

  return rels.map((r: Record<string, unknown>) => {
    const media = mediaMap.get(r.media_id as string) as Record<string, unknown> | undefined;
    return {
      id: r.id as string,
      catalogo_id: r.catalogo_id as string,
      media_id: r.media_id as string,
      orden: r.orden as number,
      label: (r.label as string | null) ?? null,
      es_portada: (r.es_portada as boolean) ?? false,
      url: (media?.url as string) ?? "",
      nombre: (media?.nombre as string) ?? "",
    };
  });
}

export async function addCatalogImageRepository(
  catalogoId: string,
  mediaId: string
) {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("catalogo_imagenes")
    .select("*", { count: "exact", head: true })
    .eq("catalogo_id", catalogoId);

  const { error } = await supabase
    .from("catalogo_imagenes")
    .insert({
      catalogo_id: catalogoId,
      media_id: mediaId,
      orden: count ?? 0,
    });

  if (error) throw error;
}

export async function updateCatalogImageLabelRepository(
  imageId: string,
  label: string
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("catalogo_imagenes")
    .update({ label })
    .eq("id", imageId);

  if (error) throw error;
}

export async function updateCatalogImagePortadaRepository(
  catalogoId: string,
  imageId: string,
  esPortada: boolean
) {
  const supabase = createAdminClient();

  if (esPortada) {
    const { error: resetError } = await supabase
      .from("catalogo_imagenes")
      .update({ es_portada: false })
      .eq("catalogo_id", catalogoId);

    if (resetError) throw resetError;
  }

  const { error } = await supabase
    .from("catalogo_imagenes")
    .update({ es_portada: esPortada })
    .eq("id", imageId);

  if (error) throw error;
}

export async function deleteCatalogImageRepository(
  imageId: string
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("catalogo_imagenes")
    .delete()
    .eq("id", imageId);

  if (error) throw error;
}

export async function setProductImageAsPortadaRepository(
  catalogoId: string,
  mediaId: string
) {
  const supabase = createAdminClient();

  // 1) Verificar si ya existe una entrada en catalogo_imagenes para este media_id y catalogo_id
  const { data: existing, error: findError } = await supabase
    .from("catalogo_imagenes")
    .select("id")
    .eq("catalogo_id", catalogoId)
    .eq("media_id", mediaId)
    .maybeSingle();

  if (findError) throw findError;

  let catalogoImagenId: string;

  if (existing) {
    // 2a) Si ya existe, usar ese id
    catalogoImagenId = existing.id as string;
  } else {
    // 2b) Si no existe, crear la entrada
    const { count } = await supabase
      .from("catalogo_imagenes")
      .select("*", { count: "exact", head: true })
      .eq("catalogo_id", catalogoId);

    const { data: inserted, error: insertError } = await supabase
      .from("catalogo_imagenes")
      .insert({
        catalogo_id: catalogoId,
        media_id: mediaId,
        orden: count ?? 0,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    catalogoImagenId = inserted.id as string;
  }

  // 3) Desmarcar todas las demás imágenes del catálogo como portada
  const { error: resetError } = await supabase
    .from("catalogo_imagenes")
    .update({ es_portada: false })
    .eq("catalogo_id", catalogoId);

  if (resetError) throw resetError;

  // 4) Marcar la imagen seleccionada como portada
  const { error: updateError } = await supabase
    .from("catalogo_imagenes")
    .update({ es_portada: true })
    .eq("id", catalogoImagenId);

  if (updateError) throw updateError;
}
