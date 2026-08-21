import { createClient } from "@/lib/supabase/server";

type CreateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
};

export async function createCatalogRepository(
  data: CreateCatalogData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("catalogo_personalizacion")
    .insert({
      tipo: data.tipo.trim().toLowerCase(),
      nombre: data.nombre.trim(),
      descripcion:
        data.descripcion.trim() || null,
      orden: data.orden,
      activo: data.activo,
    });

  if (error) {
    throw error;
  }
}
