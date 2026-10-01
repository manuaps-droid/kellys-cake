import { createClient } from "@/lib/supabase/server";

import type { AdminOrder } from "../types/order.type";

export async function getOrderByIdRepository(
  id: string
): Promise<AdminOrder | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      id,
      numero,
      created_at,
      estado,
      subtotal,
      envio,
      total,
      metodo_pago,
      referencia_pago,
      estado_pago,
      tipo_pago,
      monto_pagado,
      fecha_entrega,
      hora_entrega,
      tipo_entrega,
      clientes (
        id,
        nombre,
        correo,
        celular
      ),
      pedido_items (
        id,
        cantidad,
        precio,
        nombre,
        descripcion,
        imagen,
        productos (
          id,
          nombre,
          descripcion,
          precio,
          imagen
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  // Buscar información de webhook de pasarela (Culqi / MercadoPago) para conciliación
  let webhookPago = null;
  try {
    const { data: webhook } = await supabase
      .from("pago_webhooks")
      .select("id, fuente, status, external_reference, payment_id, created_at")
      .or(`pedido_id.eq.${id}${data.referencia_pago ? `,external_reference.eq.${data.referencia_pago}` : ""}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (webhook) {
      webhookPago = {
        fuente: webhook.fuente,
        status: webhook.status,
        external_reference: webhook.external_reference,
        payment_id: webhook.payment_id,
        created_at: webhook.created_at,
      };
    }
  } catch (err) {
    console.error("Error consultando webhook de pago:", err);
  }

  return {
    id: data.id,

    numero: data.numero ?? null,

    created_at: data.created_at,

    estado: data.estado,

    subtotal: data.subtotal,

    envio: data.envio,

    total: data.total,

    observaciones: null,

    direccion: null,

    metodo_pago: data.metodo_pago,

    referencia_pago: data.referencia_pago ?? null,

    estado_pago: data.estado_pago ?? null,

    tipo_pago: data.tipo_pago,

    monto_pagado: data.monto_pagado,

    webhook_pago: webhookPago,

    fecha_entrega: data.fecha_entrega ?? null,

    hora_entrega: data.hora_entrega ?? null,

    tipo_entrega: data.tipo_entrega ?? null,

    cliente: Array.isArray(data.clientes)
      ? data.clientes[0]
      : data.clientes,

    pedido_items: (
      data.pedido_items ?? []
    ).map((item: any) => {
      const productos = Array.isArray(item.productos)
        ? item.productos[0]
        : item.productos;

      return {
        id: item.id,

        cantidad: item.cantidad,

        precio: item.precio,

        productos:
          productos ?? {
            id: item.id,
            nombre: item.nombre ?? "Producto",
            descripcion: item.descripcion ?? null,
            imagen: item.imagen ?? "/images/placeholder-product.jpg",
            precio: item.precio,
          },
      };
    }),
  };
}