import { updateOrderDeliveryRepository } from "../repositories/update-order-delivery.repository";

import type { DeliveryScheduleInput } from "../repositories/update-order-delivery.repository";

export async function updateOrderDeliveryService(
  id: string,
  input: DeliveryScheduleInput
) {
  await updateOrderDeliveryRepository(id, input);
}
