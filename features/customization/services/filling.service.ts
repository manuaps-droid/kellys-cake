import { getFillingsRepository } from "../repositories/filling.repository";

export async function getFillingsService() {
  return getFillingsRepository();
}