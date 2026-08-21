import { createAdminClient } from "@/lib/supabase/admin";

import type { AdminCustomer } from "../types/customer.type";

export async function getCustomerByIdRepository(
  id: string
): Promise<AdminCustomer | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("clientes")
    .select(`
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
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  // Obtener pedidos del cliente
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`
      id,
      total,
      estado,
      created_at
    `)
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  // Obtener proyectos personalizados del cliente
  const { data: proyectos } = await supabase
    .from("proyectos_personalizados")
    .select(`
      id,
      personas,
      presupuesto,
      estado,
      created_at
    `)
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  return {
    ...data,
    pedidos: (pedidos ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      total: p.total as number,
      estado: p.estado as string,
      created_at: p.created_at as string,
    })),
    proyectos: (proyectos ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      personas: p.personas as number,
      presupuesto: (p.presupuesto as number) ?? null,
      estado: p.estado as string,
      created_at: p.created_at as string,
    })),
  };
}