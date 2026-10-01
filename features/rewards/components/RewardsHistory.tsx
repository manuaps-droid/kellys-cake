"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Calendar } from "lucide-react";
import { RewardsTransaccion } from "../types/rewards.types";
import { getHistoryAction } from "../actions/get-history.action";

export function RewardsHistory() {
  const [history, setHistory] = useState<RewardsTransaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const result = await getHistoryAction(1);
        if (result?.success && result.transacciones) {
          setHistory(result.transacciones);
          setHasMore(result.transacciones.length >= 10);
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getHistoryAction(nextPage);
      if (result?.success && result.transacciones) {
        setHistory((prev) => [...prev, ...result.transacciones!]);
        setHasMore(result.transacciones.length >= 10);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more history", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-kc-rose-gold animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-kc-sand border-dashed bg-kc-ivory/50">
        <Calendar className="w-10 h-10 text-kc-mocha/30 mx-auto mb-3" />
        <p className="text-kc-mocha">Aún no tienes movimientos de puntos.</p>
        <p className="text-sm text-kc-mocha/70 mt-1">Realiza compras para empezar a ganar recompensas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-kc-sand overflow-hidden">
        {history.map((item, index) => (
          <div 
            key={item.id} 
            className={`p-4 flex items-center justify-between gap-4 ${
              index !== history.length - 1 ? 'border-b border-kc-sand/50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                item.tipo === 'ganancia' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {item.tipo === 'ganancia' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-kc-charcoal">{item.motivo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-kc-mocha">{getRelativeTime(item.created_at)}</span>
                  {item.referencia_tipo && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-kc-sand text-kc-mocha">
                      {item.referencia_tipo}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-semibold ${
                item.tipo === 'ganancia' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.tipo === 'ganancia' ? '+' : '-'}{item.cantidad}
              </span>
              <p className="text-xs text-kc-mocha">pts</p>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full border border-kc-rose-gold text-kc-rose-gold font-medium text-sm hover:bg-kc-rose-gold hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
