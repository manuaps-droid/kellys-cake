import { createAdminClient } from "@/lib/supabase/admin";

export interface AgendaOrder {
  id: string;
  numero: number | null;
  total: number;
  estado: string;
  estado_pago: string | null;
  fecha_entrega: string | null;
  hora_entrega: string | null;
  tipo_entrega: string | null;
  created_at: string;
  cliente: { id: string; nombre: string } | null;
  items: {
    id: string;
    nombre: string;
    cantidad: number;
    imagen: string | null;
  }[];
}

/**
 * Pedidos confirmados y pagados con fecha de entrega programada,
 * ordenados por fecha y hora. La agenda de producción se construye
 * desde aquí.
 */
export async function getAgendaOrdersRepository(): Promise<
  AgendaOrder[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      numero,
      total,
      estado,
      estado_pago,
      fecha_entrega,
      hora_entrega,
      tipo_entrega,
      created_at,
      clientes (
        id,
        nombre
      ),
      pedido_items (
        id,
        nombre,
        cantidad,
        imagen
      )
    `)
    .in("estado", ["confirmado", "produccion", "listo"])
    .not("fecha_entrega", "is", null)
    .order("fecha_entrega", { ascending: true })
    .order("hora_entrega", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (order: any): AgendaOrder => ({
      id: order.id,
      numero: order.numero ?? null,
      total: order.total,
      estado: order.estado,
      estado_pago: order.estado_pago ?? null,
      fecha_entrega: order.fecha_entrega ?? null,
      hora_entrega: order.hora_entrega ?? null,
      tipo_entrega: order.tipo_entrega ?? null,
      created_at: order.created_at,
      cliente: Array.isArray(order.clientes)
        ? order.clientes[0]
        : order.clientes,
      items: (order.pedido_items ?? []).map((item: any) => ({
        id: item.id,
        nombre: item.nombre ?? "Producto",
        cantidad: item.cantidad,
        imagen: item.imagen ?? null,
      })),
    })
  );
}

/**
 * Pedidos confirmados y pagados que aún no tienen fecha de entrega
 * programada. Permite asignarlos dentro de la agenda.
 */
export async function getAgendaOrdersSinFechaRepository(): Promise<
  AgendaOrder[]
> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      numero,
      total,
      estado,
      estado_pago,
      fecha_entrega,
      hora_entrega,
      tipo_entrega,
      created_at,
      clientes (
        id,
        nombre
      ),
      pedido_items (
        id,
        nombre,
        cantidad,
        imagen
      )
    `
    )
    .in("estado", ["confirmado", "produccion", "listo"])
    .is("fecha_entrega", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (order: any): AgendaOrder => ({
      id: order.id,
      numero: order.numero ?? null,
      total: order.total,
      estado: order.estado,
      estado_pago: order.estado_pago ?? null,
      fecha_entrega: null,
      hora_entrega: order.hora_entrega ?? null,
      tipo_entrega: order.tipo_entrega ?? null,
      created_at: order.created_at,
      cliente: Array.isArray(order.clientes)
        ? order.clientes[0]
        : order.clientes,
      items: (order.pedido_items ?? []).map((item: any) => ({
        id: item.id,
        nombre: item.nombre ?? "Producto",
        cantidad: item.cantidad,
        imagen: item.imagen ?? null,
      })),
    })
  );
}
