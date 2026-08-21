import { getOrderByIdRepository } from "../repositories/get-order-by-id.repository";

export async function getOrderByIdService(
  id: string
) {
  return getOrderByIdRepository(id);
}