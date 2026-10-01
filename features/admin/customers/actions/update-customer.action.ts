"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

import { updateCustomerRepository } from "../repositories/update-customer.repository";

import {
  updateCustomerSchema,
  type UpdateCustomerSchema,
} from "../validations/update-customer.schema";

export async function updateCustomerAction(
  id: string,
  input: UpdateCustomerSchema
) {
  await getCurrentAdmin();

  const parsed = updateCustomerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Los datos ingresados no son válidos.",
    };
  }

  try {
    await updateCustomerRepository(id, parsed.data);

    revalidatePath("/admin/clientes");
    revalidatePath(`/admin/clientes/${id}`);

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
          : "No se pudo actualizar el cliente.",
    };
  }
}