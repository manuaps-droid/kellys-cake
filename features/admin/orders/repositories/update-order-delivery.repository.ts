import { createClient } from "@/lib/supabase/server";

export type DeliveryScheduleInput = {
  fecha_entrega?: string | null;
  hora_entrega?: string | null;
  tipo_entrega?: string | null;
};

export async function updateOrderDeliveryRepository(
  id: string,
  input: DeliveryScheduleInput
) {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.fecha_entrega !== undefined) {
    payload.fecha_entrega =
      input.fecha_entrega || null;
  }

  if (input.hora_entrega !== undefined) {
    payload.hora_entrega =
      input.hora_entrega || null;
  }

  if (input.tipo_entrega !== undefined) {
    payload.tipo_entrega =
      input.tipo_entrega || null;
  }

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("pedidos")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw error;
  }
}
