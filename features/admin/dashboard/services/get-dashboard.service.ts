import { getDashboardRepository } from "../repositories/get-dashboard.repository";

export async function getDashboardService() {
  return getDashboardRepository();
}