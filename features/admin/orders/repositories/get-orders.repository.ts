import { createClient } from "@/lib/supabase/server";

import type { AdminOrder } from "../types/order.type";

export type GetOrdersFilters = {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
};

/**
 * Devuelve una página de pedidos con sus items y cliente, aplicando
 * los filtros de búsqueda y estado en la base de datos (no en JS).
 *
 * PostgREST expone count exacto únicamente con head:false + count:"exact",
 * y `range(from, to)` provee LIMIT/OFFSET. Aquí usamos ambos.
 */
export async function getOrdersRepository(
  filters: GetOrdersFilters = {}
): Promise<{ orders: AdminOrder[]; total: number }> {
  const supabase = await createClient();

  const page = Math.max((filters.page ?? 1) - 1, 0);
  const perPage = Math.min(filters.perPage ?? 25, 100);
  const fromIdx = page * perPage;
  const toIdx = fromIdx + perPage - 1;

  let query = supabase
    .from("pedidos")
    .select(
      `
      id,
      numero,
      created_at,
      estado,
      subtotal,
      envio,
      total,
      clientes (
        id,
        nombre
      ),
      pedido_items (
        id,
        cantidad,
        precio,
        nombre,
        imagen,
        productos (
          id,
          nombre,
          imagen
        )
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  if (filters.status && filters.status !== "all") {
    query = query.eq("estado", filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    const numericTerm = /^-?\d+$/.test(term) ? Number(term) : -1;
    if (numericTerm >= 0) {
      query = query.eq("numero", numericTerm);
    } else {
      // Búsqueda textual: primero resolvemos los cliente_ids cuyos
      // datos personales coinciden (ilike), y filtramos pedidos por
      // cliente_id IN (...). Esto evita el filtro en JS y aprovecha
      // el índice `idx_pedidos_cliente_id`.
      const safeTerm = term.replace(/[%_]/g, "\\$&");
      const { data: matchedClientes } = await supabase
        .from("clientes")
        .select("id")
        .or(
          `nombre.ilike.%${safeTerm}%,apellidos.ilike.%${safeTerm}%,correo.ilike.%${safeTerm}%,celular.ilike.%${safeTerm}%`
        )
        .limit(200);

      const clienteIds = (matchedClientes ?? []).map((c) => c.id);

      if (clienteIds.length === 0) {
        return { orders: [], total: 0 };
      }
      query = query.in("cliente_id", clienteIds);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    orders: (data ?? []).map(
      (order: any): AdminOrder => ({
        id: order.id,
        numero: order.numero ?? null,
        created_at: order.created_at,
        estado: order.estado,
        subtotal: order.subtotal,
        envio: order.envio,
        total: order.total,
        cliente: Array.isArray(order.clientes)
          ? order.clientes[0]
          : order.clientes,
        pedido_items: (order.pedido_items ?? []).map((item: any) => {
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
                descripcion: null,
                imagen:
                  item.imagen ?? "/images/placeholder-product.jpg",
                precio: item.precio,
              },
          };
        }),
      })
    ),
    total: count ?? 0,
  };
}
