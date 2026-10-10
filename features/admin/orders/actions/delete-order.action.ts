"use server";

import { revalidatePath } from "next/cache";

import { deleteOrderService } from "../services/delete-order.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function deleteOrderAction(id: string) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await deleteOrderService(id);

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/catering");
    revalidatePath("/admin/proyectos");
    revalidatePath("/admin/clientes");

    return {
      success: true,
      message: "Pedido eliminado correctamente.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el pedido.",
    };
  }
}
