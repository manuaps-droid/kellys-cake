import { createClient } from "@/lib/supabase/server";

type ProductoCatalogo = {
  producto_id: string;
  precio_extra: number;
  obligatorio: boolean;
};

type CatalogoRow = {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  producto_catalogo: ProductoCatalogo[] | null;
};

export async function getProductCatalogOptionsRepository(
  productId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalogo_personalizacion")
    .select(`
      id,
      tipo,
      nombre,
      descripcion,
      orden,
      activo,
      producto_catalogo(
        producto_id,
        precio_extra,
        obligatorio
      )
    `)
    .eq("activo", true)
    .order("tipo", { ascending: true })
    .order("orden", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as CatalogoRow[];

  return rows.map((item) => {
    const relation =
      item.producto_catalogo?.find(
        (x) => x.producto_id === productId
      );

    return {
      id: item.id,
      tipo: item.tipo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      seleccionado: !!relation,
      obligatorio:
        relation?.obligatorio ?? false,
      precio_extra:
        relation?.precio_extra ?? 0,
    };
  });
}