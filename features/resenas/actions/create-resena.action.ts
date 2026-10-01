"use server";

import { revalidatePath } from 'next/cache';
import { getCurrentClient } from '@/features/auth/services/auth.server';
import { createResenaConPuntos } from '../services/resena.service';
import type { CreateResenaInput } from '../types/resena.types';

export async function createResenaAction(input: CreateResenaInput) {
  try {
    const { cliente } = await getCurrentClient();
    if (!cliente) {
      return { success: false, error: 'No autorizado' };
    }

    // Validar calificación (1 a 5 estrellas)
    const calificacion = Math.round(Number(input.calificacion));
    if (isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
      return { success: false, error: 'La calificación debe ser de 1 a 5 estrellas.' };
    }

    if (!input.producto_id || typeof input.producto_id !== 'string') {
      return { success: false, error: 'ID de producto inválido.' };
    }

    // Sanitizar comentario y limitar tamaño
    const comentarioLimpio = input.comentario
      ? input.comentario.trim().slice(0, 500)
      : null;

    const validatedInput: CreateResenaInput = {
      producto_id: input.producto_id,
      pedido_id: input.pedido_id || undefined,
      calificacion,
      comentario: comentarioLimpio || undefined,
      foto_url: input.foto_url?.trim()?.startsWith('https://') ? input.foto_url.trim() : undefined,
    };

    const result = await createResenaConPuntos(cliente.id, validatedInput);
    
    revalidatePath('/productos/[slug]', 'page');

    return { 
      success: true, 
      resena: result.resena, 
      puntosGanados: result.puntosGanados 
    };
  } catch (error) {
    console.error('Error in createResenaAction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear la reseña' };
  }
}
