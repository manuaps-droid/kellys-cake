import { deleteOrderRepository } from "../repositories/delete-order.repository";

export async function deleteOrderService(
  id: string
) {
  return deleteOrderRepository(id);
}
