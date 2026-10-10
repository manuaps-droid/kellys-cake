import { createAdminClient } from "@/lib/supabase/admin";

export interface FinalizeTopperOrderInput {
  clienteId: string;
  productoId: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  catalogoImagenId?: string;
}

/**
 * Finaliza el proyecto de topper creando el pedido en estado
 * confirmado con el topper como item, para que llegue directo a
 * la agenda de producción (queda pendiente programar la fecha de
 * entrega y registrar el pago).
 */
export async function finalizeTopperRepository(
  input: FinalizeTopperOrderInput
): Promise<{ id: string; numero: number; total: number }> {
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

    precio = producto?.precio != null ? Number(producto.precio) : null;
  }

  if (precio == null || precio <= 0) {
    throw new Error("No se pudo calcular el precio del topper.");
  }

  const total = Math.round(precio * 100) / 100;

  const { data: pedido, error: pedidoError } = await admin
    .from("pedidos")
    .insert({
      cliente_id: input.clienteId,
      subtotal: total,
      envio: 0,
      total,
      metodo_pago: "cash",
      estado: "confirmado",
      estado_pago: "pendiente",
      observaciones:
        "Pedido directo generado desde el diseñador de toppers.",
    })
    .select("id, numero")
    .single();

  if (pedidoError || !pedido) {
    throw pedidoError ?? new Error("No se pudo crear el pedido.");
  }

  const { error: itemError } = await admin
    .from("pedido_items")
    .insert({
      pedido_id: pedido.id,
      producto_id: input.productoId,
      cantidad: 1,
      precio: total,
      nombre: "Topper personalizado",
      descripcion: input.descripcion,
      imagen: input.imagen,
    });

  if (itemError) {
    throw itemError;
  }

  return {
    id: pedido.id as string,
    numero: Number(pedido.numero),
    total,
  };
}
