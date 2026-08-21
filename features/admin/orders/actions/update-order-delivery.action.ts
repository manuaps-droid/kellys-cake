"use server";

import { revalidatePath } from "next/cache";

import { updateOrderDeliveryService } from "../services/update-order-delivery.service";

import type { DeliveryScheduleInput } from "../repositories/update-order-delivery.repository";

export async function updateOrderDelivery(
  id: string,
  input: DeliveryScheduleInput
) {
  try {
    await updateOrderDeliveryService(id, input);

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/agenda");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo programar la entrega.",
    };
  }
}
