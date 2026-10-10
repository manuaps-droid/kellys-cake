"use server";

import { revalidatePath } from "next/cache";

import { updateOrderStatusService } from "../services/update-order-status.service";

import type { OrderStatus } from "@/features/orders/constants/order-status";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await updateOrderStatusService(
      id,
      status
    );

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/catering");
    revalidatePath("/admin/proyectos");
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
          : "No se pudo actualizar el pedido.",
    };
  }
}