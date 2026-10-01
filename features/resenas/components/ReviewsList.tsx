"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarRating } from './StarRating';
import { getResenasProductoAction } from '../actions/get-resenas-producto.action';
import type { Resena, ResenaStats } from '../types/resena.types';

interface ReviewsListProps {
  productoId: string;
}

export function ReviewsList({ productoId }: ReviewsListProps) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [stats, setStats] = useState<ResenaStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const perPage = 5;
  const hasMore = resenas.length < total;

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const result = await getResenasProductoAction(productoId, 1, perPage);
      if (result.success) {
        if (result.resenas) setResenas(result.resenas);
        if (result.stats) setStats(result.stats);
        if (result.total !== undefined) setTotal(result.total);
      }
      setIsLoading(false);
    };
    
    fetchInitial();
  }, [productoId]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const result = await getResenasProductoAction(productoId, nextPage, perPage);
    if (result.success && result.resenas) {
      setResenas((prev) => [...prev, ...result.resenas!]);
      setPage(nextPage);
    }
    setIsLoadingMore(false);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-32 bg-kc-sand/30 rounded-2xl w-full" />
      <div className="h-24 bg-kc-sand/30 rounded-2xl w-full" />
      <div className="h-24 bg-kc-sand/30 rounded-2xl w-full" />
    </div>;
  }

  if (resenas.length === 0) {
    return (
      <div className="text-center py-10 bg-kc-cream rounded-2xl border border-kc-sand">
        <h4 className="font-playfair text-xl text-kc-charcoal mb-2">Aún no hay reseñas</h4>
        <p className="text-kc-mocha">Sé el primero en dejar tu opinión sobre este producto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      {stats && (
        <div className="bg-white rounded-2xl p-6 border border-kc-sand flex flex-col md:flex-row gap-8 items-center">
          <div className="text-center md:text-left">
            <div className="text-5xl font-playfair text-kc-charcoal mb-2">
              {stats.promedio.toFixed(1)}
            </div>
            <StarRating readonly value={Math.round(stats.promedio)} size="md" />
            <div className="text-sm text-kc-mocha mt-2">
              Basado en {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribucion[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-12 text-kc-mocha">
                    {rating} <StarRating readonly value={1} size="sm" />
                  </div>
                  <div className="flex-1 h-2 bg-kc-sand/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-kc-gold rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-kc-mocha">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {resenas.map((resena) => (
            <motion.div
              key={resena.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-kc-sand/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-kc-blush flex items-center justify-center text-kc-charcoal font-medium">
                    {resena.cliente?.nombre?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="font-medium text-kc-charcoal">
                      {resena.cliente?.nombre} {resena.cliente?.apellidos}
                    </div>
                    <div className="text-xs text-kc-mocha">
                      {new Date(resena.created_at).toLocaleDateString('es-PE')}
                    </div>
                  </div>
                </div>
                <StarRating readonly value={resena.calificacion} size="sm" />
              </div>
              
              {resena.comentario && (
                <p className="text-kc-charcoal/80 text-sm mb-4 leading-relaxed whitespace-pre-wrap">
                  {resena.comentario}
                </p>
              )}
              
              {resena.foto_url && (
                <div className="mt-4 rounded-xl overflow-hidden max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={resena.foto_url} 
                    alt="Foto adjunta" 
                    className="w-full object-cover max-h-64 rounded-xl border border-kc-sand"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {hasMore && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 border border-kc-gold text-kc-charcoal rounded-full text-sm font-medium hover:bg-kc-gold/10 transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? 'Cargando...' : 'Cargar más reseñas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}