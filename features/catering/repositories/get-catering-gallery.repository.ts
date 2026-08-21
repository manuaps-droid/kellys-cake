import { createClient } from "@/lib/supabase/server";

export type CateringGalleryItem = {
  id: string;
  url: string;
  label: string | null;
};

export async function getCateringGalleryRepository(): Promise<CateringGalleryItem[]> {
  const supabase = await createClient();

  const { data: catalog, error: catalogError } = await supabase
    .from("catalogo_personalizacion")
    .select("id")
    .eq("tipo", "catering_gallery")
    .limit(1)
    .maybeSingle();

  if (catalogError) throw catalogError;
  if (!catalog) return [];

  const { data: rels, error: relError } = await supabase
    .from("catalogo_imagenes")
    .select("id, media_id, orden, label")
    .eq("catalogo_id", catalog.id)
    .order("orden");

  if (relError) throw relError;
  if (!rels || rels.length === 0) return [];

  const mediaIds = rels.map((r) => r.media_id);

  const { data: mediaData, error: mediaError } = await supabase
    .from("media")
    .select("id, url")
    .in("id", mediaIds);

  if (mediaError) throw mediaError;

  const urlMap = new Map(
    (mediaData ?? []).map((m: Record<string, unknown>) => [m.id as string, m.url as string])
  );

  return rels.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    url: urlMap.get(r.media_id as string) ?? "",
    label: (r.label as string | null) ?? null,
  }));
}
