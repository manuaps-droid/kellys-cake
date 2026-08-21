import { createAdminClient } from "@/lib/supabase/admin";

type UpdateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  mostrar_en_productos?: boolean;
  mostrar_en_categorias?: boolean;
  precio?: number | null;
};
export async function updateCatalogRepository(
  id: string,
  data: UpdateCatalogData
) {
  const supabase = createAdminClient();

  // Construir el objeto de update pieza por pieza.
  // Las columnas opcionales (precio, mostrar_en_productos, mostrar_en_categorias)
  // pueden no existir todavía en el schema. Si no existen, omitirlas del update
  // evita errores 42703. Si existen pero el admin no las envió, las mandamos falsy.
  const updateData: Record<string, unknown> = {
    tipo: data.tipo.trim().toLowerCase(),
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim() || null,
    orden: data.orden,
    activo: data.activo,
    updated_at: new Date().toISOString(),
  };

  if (data.mostrar_en_productos !== undefined) {
    updateData.mostrar_en_productos = data.mostrar_en_productos;
  }
  if (data.mostrar_en_categorias !== undefined) {
    updateData.mostrar_en_categorias = data.mostrar_en_categorias;
  }
  if (data.precio !== undefined) {
    updateData.precio = data.precio;
  }

  const { error } = await supabase
    .from("catalogo_personalizacion")
    .update(updateData)
    .eq("id", id);

  if (error) {
    // Si el error es "column does not exist", reintentar sin columnas opcionales
    // para que al menos la edición básica (nombre, descripción, orden, activo) no falle.
    if ((error as { code?: string }).code === "42703") {
      const safeData: Record<string, unknown> = {
        tipo: updateData.tipo,
        nombre: updateData.nombre,
        descripcion: updateData.descripcion,
        orden: updateData.orden,
        activo: updateData.activo,
        updated_at: updateData.updated_at,
      };
      const retry = await supabase
        .from("catalogo_personalizacion")
        .update(safeData)
        .eq("id", id);
      if (retry.error) {
        throw retry.error;
      }
      return;
    }
    throw error;
  }
}
