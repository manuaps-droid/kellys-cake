"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getRewardsForClient } from "../services/rewards.service";
import { RewardsResumen } from "../types/rewards.types";

export async function getRewardsAction(): Promise<{ success: boolean; rewards?: RewardsResumen; message?: string }> {
  try {
    const { cliente } = await getCurrentClient();

    const rewards = await getRewardsForClient(cliente.id);
    if (!rewards) {
      return { success: false, message: "No se pudieron obtener las recompensas" };
    }

    return { success: true, rewards };
  } catch (error) {
    console.error("Error in getRewardsAction:", error);
    return { success: false, message: "Error al obtener recompensas" };
  }
}
