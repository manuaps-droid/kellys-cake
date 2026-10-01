"use server";

import { getProductoResenas } from "../services/resena.service";

export async function getProductResenasAction(
  productoId: string,
  page: number = 1,
  perPage: number = 10
) {
  try {
    const result = await getProductoResenas(productoId, page, perPage);
    return { success: true, ...result };
  } catch (error) {
    console.error("Error fetching resenas:", error);
    return {
      success: false,
      resenas: [],
      stats: { promedio: 0, total: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      total: 0,
    };
  }
}