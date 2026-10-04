import { createClient } from "@/lib/supabase/server";
import { RewardsResumen, RewardsPuntos, RewardsNivel } from "../types/rewards.types";
import { procesarVencimientoPuntosCliente } from "../services/expiration.service";

export async function getRewardsRepository(clienteId: string): Promise<RewardsResumen | null> {
  const supabase = await createClient();

  // 1. Obtener configuración de marketing/fidelización para días de vencimiento
  let diasVencimiento = 365;
  try {
    const { getPublicMarketing } = await import("@/features/admin/configuracion/queries/public-config.query");
    const m = await getPublicMarketing();
    if (m?.dias_vencimiento_puntos) diasVencimiento = m.dias_vencimiento_puntos;
  } catch (e) {
    // defaults to 365
  }

  // 2. Procesar y descontar automáticamente puntos con más de 365 días
  const vencimientoInfo = await procesarVencimientoPuntosCliente(clienteId, diasVencimiento);

  // 3. Obtener puntos y nivel actualizado del cliente
  const { data: puntosData, error: puntosError } = await supabase
    .from('rewards_puntos')
    .select('*, nivel:rewards_niveles(*)')
    .eq('cliente_id', clienteId)
    .single();

  if (puntosError && puntosError.code !== 'PGRST116') {
    console.error('Error fetching rewards puntos:', puntosError);
    return null;
  }

  // 4. Obtener todos los niveles para calcular progreso
  const { data: nivelesData, error: nivelesError } = await supabase
    .from('rewards_niveles')
    .select('*')
    .order('orden', { ascending: true });

  if (nivelesError) {
    console.error('Error fetching rewards niveles:', nivelesError);
    return null;
  }

  const niveles = nivelesData as RewardsNivel[];
  
  // Si no hay puntos registrados, inicializar
  let puntos: RewardsPuntos;
  if (!puntosData) {
    puntos = {
      id: '',
      cliente_id: clienteId,
      puntos_totales: 0,
      puntos_disponibles: 0,
      nivel_id: niveles.length > 0 ? niveles[0].id : null,
      nivel: niveles.length > 0 ? niveles[0] : null,
      updated_at: new Date().toISOString()
    };
  } else {
    puntos = puntosData as RewardsPuntos;
  }

  const nivelActual = puntos.nivel || null;
  let siguienteNivel: RewardsNivel | null = null;
  
  if (nivelActual) {
    siguienteNivel = niveles.find(n => n.orden === nivelActual.orden + 1) || null;
  } else if (niveles.length > 0) {
    siguienteNivel = niveles[0];
  }

  let progreso_pct = 100;
  if (siguienteNivel) {
    const minPuntosActual = nivelActual ? nivelActual.puntos_minimos : 0;
    const metaPuntos = siguienteNivel.puntos_minimos;
    const puntosActuales = puntos.puntos_totales;
    
    if (puntosActuales >= metaPuntos) {
      progreso_pct = 100;
    } else if (puntosActuales <= minPuntosActual) {
      progreso_pct = 0;
    } else {
      progreso_pct = ((puntosActuales - minPuntosActual) / (metaPuntos - minPuntosActual)) * 100;
    }
  }

  return {
    puntos,
    nivel_actual: nivelActual,
    siguiente_nivel: siguienteNivel,
    progreso_pct: Math.min(Math.max(progreso_pct, 0), 100),
    vencimiento_info: vencimientoInfo,
  };
}
