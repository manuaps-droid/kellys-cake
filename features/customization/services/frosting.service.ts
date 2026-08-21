import { getFrostingsRepository } from "../repositories/frosting.repository";

export async function getFrostingsService() {
  return getFrostingsRepository();
}