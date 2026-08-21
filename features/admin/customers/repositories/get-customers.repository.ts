import { createClient } from "@/lib/supabase/server";

import type { AdminCustomer } from "../types/customer.type";

export type GetCustomersFilters = {
  search?: string;
  page?: number;
  perPage?: number;
};

/**
 * Devuelve una página de clientes, aplicando el filtro de búsqueda
 * en la base de datos (no en JS).
 */
export async function getCustomersRepository(
  filters: GetCustomersFilters = {}
): Promise<{ customers: AdminCustomer[]; total: number }> {
  const supabase = await createClient();

  const page = Math.max((filters.page ?? 1) - 1, 0);
  const perPage = Math.min(filters.perPage ?? 25, 100);
  const fromIdx = page * perPage;
  const toIdx = fromIdx + perPage - 1;

  let query = supabase
    .from("clientes")
    .select(
      `
      id,
      nombre,
      apellidos,
      correo,
      celular,
      created_at,
      user_id,
      rol,
      activo,
      foto
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  if (filters.search && filters.search.trim()) {
    const safe = filters.search.trim().replace(/[%_]/g, "\\$&");
    query = query.or(
      `nombre.ilike.%${safe}%,apellidos.ilike.%${safe}%,correo.ilike.%${safe}%,celular.ilike.%${safe}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    customers: data ?? [],
    total: count ?? 0,
  };
}
