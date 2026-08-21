"use server";

import { getOrderByIdService } from "../services/get-order-by-id.service";

export async function getOrderByIdAction(
  id: string
) {
  try {
    const order =
      await getOrderByIdService(id);

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      order: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el pedido.",
    };
  }
}