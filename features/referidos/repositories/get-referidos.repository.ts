import { createClient } from "@/lib/supabase/server";
import { Referido, ReferidoStats } from "../types/referido.types";

export async function getReferidosRepository(
  referenteId: string
): Promise<{ referidos: Referido[]; stats: ReferidoStats }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('referidos')
    .select('*, referido:clientes!referido_id(nombre, apellidos)')
    .eq('referente_id', referenteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching referidos:", error);
    return {
      referidos: [],
      stats: { codigo: '', total_referidos: 0, completados: 0, pendientes: 0, puntos_ganados: 0 }
    };
  }

  const referidos = data as Referido[];
  
  const stats: ReferidoStats = {
    codigo: referidos.length > 0 ? referidos[0].codigo : '',
    total_referidos: referidos.length,
    completados: referidos.filter(r => r.estado === 'completado').length,
    pendientes: referidos.filter(r => r.estado === 'pendiente' || r.estado === 'registrado').length,
    puntos_ganados: referidos
      .filter(r => r.estado === 'completado')
      .reduce((sum, r) => sum + r.recompensa_referente, 0)
  };

  return { referidos, stats };
}
