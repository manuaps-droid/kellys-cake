import { createAdminClient } from "@/lib/supabase/admin";

export type ProductoTiendaItem = {
  id: string;
  nombre: string;
  categoria: string;
  precio: number | null;
  estado: string;
  url: string;
};

/**
 * Todos los productos de la tienda online (los mismos del menú
 * Productos del admin) para usarlos como origen al crear
 * productos finales en FoodOS.
 */
export async function getProductosTienda(): Promise<
  ProductoTiendaItem[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("productos")
    .select(
      "id, nombre, categoria, precio, estado, media:imagen_principal_id (url)"
    )
    .order("categoria", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error leyendo productos de la tienda:", error.message);
    return [];
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map(
    (p) => {
      const media = Array.isArray(p.media)
        ? (p.media as Array<{ url: string }>)[0]
        : (p.media as { url: string } | null);

      return {
        id: p.id as string,
        nombre: (p.nombre as string) ?? "",
        categoria: (p.categoria as string) ?? "Sin categoría",
        precio:
          p.precio != null ? Number(p.precio) : null,
        estado: (p.estado as string) ?? "publicado",
        url: media?.url ?? "",
      };
    }
  );
}
