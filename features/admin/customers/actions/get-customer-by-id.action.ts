"use server";

import { getCustomerByIdService } from "../services/get-customer-by-id.service";

export async function getCustomerByIdAction(
  id: string
) {
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