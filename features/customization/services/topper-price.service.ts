import { createAdminClient } from "@/lib/supabase/admin";

import { TOPPER_PRECIO_BASE } from "../constants/topper.constants";

export type ResolveTopperPrecioInput = {
  productoId: string;
  catalogoImagenId?: string;
};

/**
 * Resuelve en el servidor el precio real del topper, en el mismo
 * orden que la UI: precio del diseño en el catálogo y, si no
 * tiene, el precio fijo del producto topper en `productos`.
 * Como último recurso se usa el precio base del topper, igual
 * que muestra la página del diseñador.
 */
export async function resolveTopperPrecioService(
  input: ResolveTopperPrecioInput
): Promise<number> {
  const admin = createAdminClient();

  let precio: number | null = null;

  if (input.catalogoImagenId) {
    const { data: diseno } = await admin
      .from("catalogo_imagenes")
      .select("precio")
      .eq("id", input.catalogoImagenId)
      .maybeSingle();

    precio = diseno?.precio != null ? Number(diseno.precio) : null;
  }

  if (precio == null) {
    const { data: producto } = await admin
      .from("productos")
      .select("precio")
      .eq("id", input.productoId)
      .maybeSingle();

    precio =
      producto?.precio != null ? Number(producto.precio) : null;
  }

  if (precio == null || precio <= 0) {
    precio = TOPPER_PRECIO_BASE;
  }

  return Math.round(precio * 100) / 100;
}
