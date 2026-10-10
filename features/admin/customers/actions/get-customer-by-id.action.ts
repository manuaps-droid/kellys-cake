"use server";

import { getCustomerByIdService } from "../services/get-customer-by-id.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getCustomerByIdAction(
  id: string
) {
  if (!(await checkIsAdmin())) {
    return { success: false, customer: null, message: "No autorizado." };
  }

  try {
    const customer =
      await getCustomerByIdService(id);

    return {
      success: true,
      customer,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      customer: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el cliente.",
    };
  }
}