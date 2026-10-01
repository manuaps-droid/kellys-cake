"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getRewardsHistory } from "../services/rewards.service";
import { RewardsTransaccion } from "../types/rewards.types";

export async function getHistoryAction(
  page: number = 1,
  perPage: number = 10
): Promise<{ success: boolean; transacciones?: RewardsTransaccion[]; total?: number; message?: string }> {
  try {
    const { cliente } = await getCurrentClient();

    const { transacciones, total } = await getRewardsHistory(cliente.id, page, perPage);
    
    return { success: true, transacciones, total };
  } catch (error) {
    console.error("Error in getHistoryAction:", error);
    return { success: false, message: "Error al obtener el historial" };
  }
}
