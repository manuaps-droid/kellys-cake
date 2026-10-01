"use server";

import { getProductoResenas } from '../services/resena.service';

export async function getResenasProductoAction(productoId: string, page?: number, perPage?: number) {
  try {
    const result = await getProductoResenas(productoId, page, perPage);
    return { 
      success: true, 
      resenas: result.resenas, 
      stats: result.stats, 
      total: result.total 
    };
  } catch (error) {
    console.error('Error in getResenasProductoAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error al obtener reseñas' };
  }
}
