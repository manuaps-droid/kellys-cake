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

  // Obtener puntos y nivel del cliente
  const { data: puntos } = await supabase
    .from("rewards_puntos")
    .select(`
      puntos_totales,
      puntos_disponibles,
      rewards_niveles ( nombre )
    `)
    .eq("cliente_id", id)
    .maybeSingle();

  // Obtener historial de origen y canje de puntos
  const { data: transacciones } = await supabase
    .from("rewards_transacciones")
    .select(`
      id,
      tipo,
      cantidad,
      motivo,
      referencia_id,
      referencia_tipo,
      created_at
    `)
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  const nivelObj = puntos?.rewards_niveles as { nombre?: string } | null;

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
    rewards: puntos
      ? {
          puntos_totales: Number(puntos.puntos_totales) || 0,
          puntos_disponibles: Number(puntos.puntos_disponibles) || 0,
          nivel: nivelObj?.nombre ?? null,
        }
      : null,
    transacciones_puntos: (transacciones ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      tipo: (t.tipo as "ganancia" | "canje") || "ganancia",
      cantidad: Number(t.cantidad) || 0,
      motivo: (t.motivo as string) || "Puntos otorgados",
      referencia_id: (t.referencia_id as string) ?? null,
      referencia_tipo: (t.referencia_tipo as string) ?? null,
      created_at: t.created_at as string,
    })),
  };
}