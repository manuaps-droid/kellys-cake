import { getRewardsRepository } from "../repositories/get-rewards.repository";
import { getHistoryRepository } from "../repositories/get-history.repository";
import { RewardsResumen, RewardsTransaccion } from "../types/rewards.types";

export async function getRewardsForClient(clienteId: string): Promise<RewardsResumen | null> {
  return getRewardsRepository(clienteId);
}

export async function getRewardsHistory(
  clienteId: string,
  page?: number,
  perPage?: number
): Promise<{ transacciones: RewardsTransaccion[]; total: number }> {
  return getHistoryRepository(clienteId, page, perPage);
}
