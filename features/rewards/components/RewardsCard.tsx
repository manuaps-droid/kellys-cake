"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Loader2 } from "lucide-react";
import { RewardsResumen } from "../types/rewards.types";
import { getRewardsAction } from "../actions/get-rewards.action";
import { RewardsLevelBadge } from "./RewardsLevelBadge";

export function RewardsCard() {
  const [rewards, setRewards] = useState<RewardsResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const result = await getRewardsAction();
        if (result?.success && result.rewards) {
          setRewards(result.rewards);
        }
      } catch (error) {
        console.error("Failed to fetch rewards", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-kc-blush/20 to-kc-sand/30 shadow-md flex items-center justify-center border border-kc-sand/50">
        <Loader2 className="w-8 h-8 text-kc-rose-gold animate-spin" />
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="w-full p-8 rounded-2xl bg-gradient-to-br from-kc-blush/20 to-kc-sand/30 shadow-md border border-kc-sand/50 text-center">
        <p className="text-kc-mocha">No se pudo cargar la información de recompensas.</p>
      </div>
    );
  }

  const { puntos, nivel_actual, siguiente_nivel, progreso_pct } = rewards;

  return (
    <div className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-kc-blush/20 to-kc-sand/30 shadow-md border border-kc-sand/50 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-kc-rose-gold/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-kc-gold/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-kc-mocha uppercase tracking-wider mb-1">
              Tu Nivel Actual
            </p>
            <RewardsLevelBadge nivel={nivel_actual} size="lg" />
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-[family-name:var(--font-playfair)] font-bold text-kc-charcoal">
                {puntos.puntos_disponibles}
              </span>
              <Star className="w-6 h-6 text-kc-gold fill-kc-gold" />
            </div>
            <p className="text-sm font-medium text-kc-mocha">puntos disponibles</p>
          </div>
        </div>

        {siguiente_nivel && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm text-kc-charcoal font-medium">Progreso hacia nivel {siguiente_nivel.nombre}</p>
              <p className="text-xs text-kc-mocha">
                Faltan {siguiente_nivel.puntos_minimos - puntos.puntos_totales} pts
              </p>
            </div>
            <div className="h-2 w-full bg-kc-ivory rounded-full overflow-hidden border border-kc-sand shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, progreso_pct))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-kc-rose-gold to-kc-gold rounded-full"
              />
            </div>
          </div>
        )}

        {nivel_actual?.beneficios && nivel_actual.beneficios.length > 0 && (
          <div className="bg-kc-cream/80 backdrop-blur-sm rounded-xl p-5 border border-white/50">
            <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-kc-charcoal mb-3 text-lg">
              Tus Beneficios
            </h4>
            <ul className="space-y-2">
              {nivel_actual.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-kc-charcoal">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
