import { getResenasByProducto } from "../repositories/get-resenas.repository";
import { createResena } from "../repositories/create-resena.repository";
import { CreateResenaInput, Resena, ResenaStats } from "../types/resena.types";
import { awardPoints } from "@/features/rewards/services/award-points.service";
import { REWARD_RULES } from "@/features/rewards/constants/reward-rules";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getProductoResenas(productoId: string, page = 1, perPage = 10): Promise<{ resenas: Resena[], stats: ResenaStats, total: number }> {
  return getResenasByProducto(productoId, page, perPage);
}

export async function createResenaConPuntos(clienteId: string, input: CreateResenaInput): Promise<{ resena: Resena, puntosGanados: number }> {
  // Evitar farming de puntos: una sola reseña por cliente y producto
  const admin = createAdminClient();
  const { data: existente } = await admin
    .from("resenas")
    .select("id")
    .eq("cliente_id", clienteId)
    .eq("producto_id", input.producto_id)
    .maybeSingle();

  if (existente) {
    throw new Error("Ya dejaste una reseña para este producto.");
  }

  const resena = await createResena(clienteId, input);
  
  // Award points based on whether a photo was included
  const puntosGanados = input.foto_url ? REWARD_RULES.RESENA_CON_FOTO : 10;
  const descripcion = input.foto_url ? "Reseña de producto con foto" : "Reseña de producto";
  
  try {
    await awardPoints(clienteId, puntosGanados, descripcion, resena.id, "resena");
  } catch (error) {
    console.error("Failed to award points for review:", error);
    // Continue even if points fail, since review is created
  }
  
  return { resena, puntosGanados };
}
