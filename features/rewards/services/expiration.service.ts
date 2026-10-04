import { createAdminClient } from "@/lib/supabase/admin";

export interface VencimientoInfo {
  dias_vigencia: number;
  puntos_proximos_a_vencer: number;
  dias_para_proximo_vencimiento: number | null;
  fecha_proximo_vencimiento: string | null;
}

/**
 * Evalúa las transacciones del cliente, descuenta los puntos cuya
 * antigüedad supere los días configurados (por defecto 365 días),
 * y calcula el tiempo restante para el próximo vencimiento.
 */
export async function procesarVencimientoPuntosCliente(
  clienteId: string,
  diasVencimiento: number = 365
): Promise<VencimientoInfo> {
  const supabase = createAdminClient();

  // 1. Obtener todas las transacciones del cliente
  const { data: transacciones, error } = await supabase
    .from("rewards_transacciones")
    .select("id, tipo, cantidad, motivo, created_at")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: true });

  if (error || !transacciones) {
    return {
      dias_vigencia: diasVencimiento,
      puntos_proximos_a_vencer: 0,
      dias_para_proximo_vencimiento: null,
      fecha_proximo_vencimiento: null,
    };
  }

  const now = new Date();
  const limiteVencimientoMs = diasVencimiento * 24 * 60 * 60 * 1000;
  const fechaCorte = new Date(now.getTime() - limiteVencimientoMs);

  let totalGanadosVencidos = 0;
  let totalYaDescontadosVencimiento = 0;

  let proximoVencimientoFecha: Date | null = null;
  let puntosProximoVencimiento = 0;

  for (const t of transacciones) {
    const tDate = new Date(t.created_at);
    if (t.tipo === "ganancia") {
      if (tDate <= fechaCorte) {
        totalGanadosVencidos += t.cantidad;
      } else {
        const fechaExpira = new Date(tDate.getTime() + limiteVencimientoMs);
        if (!proximoVencimientoFecha || fechaExpira < proximoVencimientoFecha) {
          proximoVencimientoFecha = fechaExpira;
          puntosProximoVencimiento = t.cantidad;
        }
      }
    } else if (t.tipo === "vencimiento" || t.motivo.toLowerCase().includes("vencimiento")) {
      totalYaDescontadosVencimiento += t.cantidad;
    }
  }

  const puntosADescontar = Math.max(0, totalGanadosVencidos - totalYaDescontadosVencimiento);

  if (puntosADescontar > 0) {
    const { data: puntosRow } = await supabase
      .from("rewards_puntos")
      .select("puntos_disponibles, puntos_totales")
      .eq("cliente_id", clienteId)
      .single();

    if (puntosRow && puntosRow.puntos_disponibles > 0) {
      const cantidadReal = Math.min(puntosADescontar, puntosRow.puntos_disponibles);

      await supabase
        .from("rewards_puntos")
        .update({
          puntos_disponibles: Math.max(0, puntosRow.puntos_disponibles - cantidadReal),
          updated_at: new Date().toISOString(),
        })
        .eq("cliente_id", clienteId);

      // Registrar transacción de vencimiento
      await supabase.from("rewards_transacciones").insert({
        cliente_id: clienteId,
        tipo: "vencimiento",
        cantidad: cantidadReal,
        motivo: `Vencimiento de puntos (+${diasVencimiento} días)`,
        referencia_tipo: "vencimiento",
      });
    }
  }

  let diasRestantes: number | null = null;
  if (proximoVencimientoFecha) {
    const diffMs = proximoVencimientoFecha.getTime() - now.getTime();
    diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    dias_vigencia: diasVencimiento,
    puntos_proximos_a_vencer: puntosProximoVencimiento,
    dias_para_proximo_vencimiento: diasRestantes,
    fecha_proximo_vencimiento: proximoVencimientoFecha ? proximoVencimientoFecha.toISOString() : null,
  };
}
