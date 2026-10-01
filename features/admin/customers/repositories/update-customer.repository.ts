import { createAdminClient } from "@/lib/supabase/admin";

import type { UpdateCustomerSchema } from "../validations/update-customer.schema";

export async function updateCustomerRepository(
  id: string,
  input: UpdateCustomerSchema
) {
  const supabase = createAdminClient();

  const payload: Record<string, unknown> = {
    nombre: input.nombre,
    apellidos: input.apellidos || null,
    correo: input.correo || null,
    celular: input.celular || null,
    dni: input.dni || null,
    activo: input.activo,
  };

  const { error } = await supabase
    .from("clientes")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }
}