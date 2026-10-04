import { createAdminClient } from "@/lib/supabase/admin";
import { calcularPuntosPorCompra } from "../constants/reward-rules";

export async function awardPoints(
  clienteId: string,
  cantidad: number,
  motivo: string,
  refId?: string,
  refTipo?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.rpc('award_points', {
      p_cliente_id: clienteId,
      p_cantidad: cantidad,
      p_motivo: motivo,
      p_referencia_id: refId || null,
      p_referencia_tipo: refTipo || null
    });

    if (error) {
      console.error('Error awarding points:', error);
      return { success: false, message: 'Error al otorgar puntos' };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in awardPoints:', err);
    return { success: false, message: 'Excepción al otorgar puntos' };
  }
}

export async function awardPointsForPurchase(
  clienteId: string,
  totalCompra: number,
  pedidoId: string
): Promise<{ success: boolean; message?: string }> {
  let solesBase = 10;
  let puntosBase = 5;

  try {
    const { getPublicMarketing } = await import("@/features/admin/configuracion/queries/public-config.query");
    const marketing = await getPublicMarketing();
    if (marketing?.soles_por_puntos) solesBase = marketing.soles_por_puntos;
    if (marketing?.puntos_otorgados) puntosBase = marketing.puntos_otorgados;
  } catch (e) {
    // fallback a defaults
  }

  const puntos = calcularPuntosPorCompra(totalCompra, solesBase, puntosBase);
  if (puntos <= 0) return { success: true }; // No points to award
  
  return awardPoints(clienteId, puntos, `Compra de productos (S/ ${totalCompra.toFixed(2)})`, pedidoId, 'pedido');
}
