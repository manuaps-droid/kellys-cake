"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { createResenaAction } from '../actions/create-resena.action';
import type { CreateResenaInput } from '../types/resena.types';

interface ReviewFormProps {
  productoId: string;
  pedidoId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productoId, pedidoId, onSuccess }: ReviewFormProps) {
  const [calificacion, setCalificacion] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (calificacion === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    
    const input: CreateResenaInput = {
      producto_id: productoId,
      pedido_id: pedidoId,
      calificacion,
      comentario: comentario.trim() || undefined,
      foto_url: fotoUrl || undefined,
    };

    const result = await createResenaAction(input);
    
    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        `¡Gracias por tu reseña!${result.puntosGanados ? ` Has ganado ${result.puntosGanados} puntos.` : ''}`
      );
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.error || 'Ocurrió un error al enviar tu reseña');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-kc-cream rounded-2xl p-6 shadow-sm border border-kc-sand"
    >
      <h3 className="font-playfair text-2xl text-kc-charcoal mb-4">Escribe una reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-kc-mocha mb-2">
            Tu calificación <span className="text-red-500">*</span>
          </label>
          <StarRating 
            value={calificacion} 
            onChange={setCalificacion} 
            size="lg" 
          />
        </div>

        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-kc-mocha mb-2">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full rounded-xl border border-kc-sand bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-kc-gold"
            placeholder="¿Qué te pareció este producto?"
          />
          <div className="text-xs text-right text-kc-mocha mt-1">
            {comentario.length}/500
          </div>
        </div>

        <div>
          <label htmlFor="fotoUrl" className="block text-sm font-medium text-kc-mocha mb-2">
            URL de la foto (opcional)
          </label>
          <input
            id="fotoUrl"
            type="url"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            className="w-full rounded-xl border border-kc-sand bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-kc-gold"
            placeholder="https://ejemplo.com/mifoto.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || calificacion === 0}
          className="w-full bg-kc-charcoal text-white rounded-xl py-3 font-medium transition-colors hover:bg-kc-deep disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </form>
    </motion.div>
  );
}
