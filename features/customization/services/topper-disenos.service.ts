import { createAdminClient } from "@/lib/supabase/admin";
import {
  TOPPER_CATALOGO_ID,
  TOPPER_PRECIO_BASE,
  TOPPER_PRODUCTO_SLUG,
} from "../constants/topper.constants";

export type TopperDisenoData = {
  id: string;
  url: string;
  nombre: string;
  precio: number | null;
};

export type TopperInfo = {
  productoId: string;
  precioBase: number;
  disenos: TopperDisenoData[];
};

export async function getTopperInfo(): Promise<TopperInfo | null> {
  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("productos")
    .select("id, precio")
    .eq("slug", TOPPER_PRODUCTO_SLUG)
    .eq("estado", "publicado")
    .maybeSingle();

  if (!producto) return null;

  const { data: rels } = await supabase
    .from("catalogo_imagenes")
    .select("id, media_id, precio")
    .eq("catalogo_id", TOPPER_CATALOGO_ID)
    .order("orden");

  const mediaIds = (rels ?? []).map((r) => r.media_id as string);

  const { data: mediaData } = await supabase
    .from("media")
    .select("id, url, nombre")
    .in(
      "id",
      mediaIds.length > 0 ? mediaIds : ["00000000-0000-0000-0000-000000000000"]
    );

  const mediaMap = new Map((mediaData ?? []).map((m) => [m.id as string, m]));

  const disenos = (rels ?? [])
    .map((r) => {
      const media = mediaMap.get(r.media_id as string);
      return {
        id: r.id as string,
        url: (media?.url as string) ?? "",
        nombre: (media?.nombre as string) ?? "",
        precio: (r.precio as number | null) ?? null,
      };
    })
    .filter((d) => d.url !== "");

  return {
    productoId: producto.id as string,
    precioBase:
      (producto.precio as number | null) ?? TOPPER_PRECIO_BASE,
    disenos,
  };
}
