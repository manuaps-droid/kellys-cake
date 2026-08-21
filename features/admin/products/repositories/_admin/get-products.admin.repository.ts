import { createAdminClient } from "@/lib/supabase/admin";

export type AdminProductRow = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precio: number;
  catalogo_id: string | null;
  catalogo_nombre: string | null;
  imagen_principal_id: string | null;
  imagen_url: string | null;
  disponible: boolean;
  destacado: boolean;
  estado: string;
  created_at: string;
};

export async function getProductsAdminRepository(): Promise<
  AdminProductRow[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      slug,
      descripcion,
      precio,
      catalogo_id,
      catalogo_personalizacion!catalogo_id (
        nombre
      ),
      imagen_principal_id,
      media:imagen_principal_id (
        url
      ),
      disponible,
      destacado,
      estado,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((r: Record<string, unknown>) => {
    const cat = Array.isArray(r.catalogo_personalizacion)
      ? (r.catalogo_personalizacion as Array<Record<string, unknown>>)[0]
      : (r.catalogo_personalizacion as Record<string, unknown> | null);

    const media = Array.isArray(r.media)
      ? (r.media as Array<Record<string, unknown>>)[0]
      : (r.media as Record<string, unknown> | null);

    return {
      id: r.id as string,
      nombre: r.nombre as string,
      slug: r.slug as string,
      descripcion: r.descripcion as string | null,
      precio: r.precio as number,
      catalogo_id: r.catalogo_id as string | null,
      catalogo_nombre: (cat?.nombre as string) ?? null,
      imagen_principal_id: r.imagen_principal_id as string | null,
      imagen_url: (media?.url as string) ?? null,
      disponible: r.disponible as boolean,
      destacado: r.destacado as boolean,
      estado: r.estado as string,
      created_at: r.created_at as string,
    };
  });
}
