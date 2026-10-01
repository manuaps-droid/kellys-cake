import { getResenasByProducto, getResenasByCliente } from "../repositories/get-resenas.repository";
import { createResena } from "../repositories/create-resena.repository";
import { CreateResenaInput, Resena, ResenaStats } from "../types/resena.types";
import { awardPoints } from "@/features/rewards/services/award-points.service";
import { REWARD_RULES } from "@/features/rewards/constants/reward-rules";

export async function getProductoResenas(productoId: string, page = 1, perPage = 10): Promise<{ resenas: Resena[], stats: ResenaStats, total: number }> {
  return getResenasByProducto(productoId, page, perPage);
}

export async function createResenaConPuntos(clienteId: string, input: CreateResenaInput): Promise<{ resena: Resena, puntosGanados: number }> {
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
