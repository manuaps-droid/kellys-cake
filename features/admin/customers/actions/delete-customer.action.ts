"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

import { deleteCustomerService } from "../services/delete-customer.service";

export async function deleteCustomerAction(
  id: string
) {
  await getCurrentAdmin();

  try {
    const { authUserDeleted } =
      await deleteCustomerService(id);

    revalidatePath("/admin/clientes");

    return {
      success: true,
      message: authUserDeleted
        ? undefined
        : "El cliente fue eliminado, pero su cuenta de acceso no pudo borrarse.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el cliente.",
    };
  }
}