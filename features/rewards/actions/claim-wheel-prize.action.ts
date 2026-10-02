"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { awardPoints } from "@/features/rewards/services/award-points.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const VALID_PRIZES = [
  { label: '20 puntos', value: 20, type: 'puntos' },
  { label: '5% dcto', value: 5, type: 'descuento' },
  { label: '50 puntos', value: 50, type: 'puntos' },
  { label: '10% dcto', value: 10, type: 'descuento' },
  { label: '30 puntos', value: 30, type: 'puntos' },
  { label: 'Delivery gratis', value: 0, type: 'otro' },
  { label: '100 puntos', value: 100, type: 'puntos' },
  { label: '15% dcto', value: 15, type: 'descuento' },
] as const;

export async function claimWheelPrizeAction(prize: { label: string; value: number; type: string }) {
  try {
    const { cliente } = await getCurrentClient();
    
    // Verificar que no haya girado la ruleta antes (doble check)
    if (cliente.ruleta_girada) {
      return { success: false, message: "Ya has girado la ruleta de bienvenida." };
    }

    // Validación de lista blanca contra manipulación de valores
    const matchedPrize = VALID_PRIZES.find(
      (p) => p.label === prize.label && p.value === prize.value && p.type === prize.type
    );

    if (!matchedPrize) {
      return { success: false, message: "Premio inválido o manipulado." };
    }

    const supabase = createAdminClient();

    // Si es puntos, otorgar únicamente el valor validado en la lista blanca
    if (matchedPrize.type === 'puntos') {
      const result = await awardPoints(cliente.id, matchedPrize.value, `Premio de Ruleta: ${matchedPrize.label}`);
      if (!result.success) {
        return { success: false, message: "Hubo un error al reclamar los puntos." };
      }
    } else {
      // Si es descuento, podríamos guardar el cupón o enviar un email,
      // pero por ahora solo dejamos constancia de que ganó.
      // (TODO: Lógica de cupones de descuento, fuera del alcance actual de esta fase)
    }

    // Actualizar el flag del cliente para que no vuelva a girar si la columna existe en BD
    try {
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ ruleta_girada: true })
        .eq('id', cliente.id);
        
      if (updateError) {
        console.warn("Advertencia al actualizar ruleta_girada en clientes:", updateError.message);
      }
    } catch (e) {
      console.warn("Error al intentar actualizar ruleta_girada:", e);
    }

    revalidatePath('/mi-cuenta');
    return { success: true, message: `¡Felicidades! Has reclamado: ${prize.label}` };
  } catch (error) {
    console.error("Error claimWheelPrizeAction:", error);
    return { success: false, message: "Error interno al reclamar premio." };
  }
}
