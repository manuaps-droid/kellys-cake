import { createClient } from "@/lib/supabase/server";
import { CreateResenaInput, Resena } from "../types/resena.types";

export async function createResena(clienteId: string, input: CreateResenaInput): Promise<Resena> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("resenas")
    .insert({
      cliente_id: clienteId,
      producto_id: input.producto_id,
      pedido_id: input.pedido_id || null,
      calificacion: input.calificacion,
      comentario: input.comentario || null,
      foto_url: input.foto_url || null,
      aprobada: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear reseña: ${error.message}`);
  }

  return data as Resena;
}
