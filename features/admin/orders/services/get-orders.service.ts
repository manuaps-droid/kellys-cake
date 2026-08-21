import { getOrdersRepository, type GetOrdersFilters } from "../repositories/get-orders.repository";

export async function getOrdersService(filters?: GetOrdersFilters) {
  return getOrdersRepository(filters ?? {});
}
