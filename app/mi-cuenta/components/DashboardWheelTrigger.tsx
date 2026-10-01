"use client";

import { useState, useEffect } from "react";
import RewardsWheel from "@/components/marketing/RewardsWheel";
import { claimWheelPrizeAction } from "@/features/rewards/actions/claim-wheel-prize.action";
import { toast } from "sonner";
import { Gift } from "lucide-react";

export default function DashboardWheelTrigger({ ruletaGirada }: { ruletaGirada: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSpun, setHasSpun] = useState(ruletaGirada);

  useEffect(() => {
    // Si nunca ha girado la ruleta, abrimos el modal automáticamente o podemos mostrar un banner
    if (!hasSpun) {
      // Podríamos abrirla automáticamente, pero es mejor que el usuario decida girar
    }
  }, [hasSpun]);

  const handlePrizeWon = async (prize: any) => {
    setHasSpun(true);
    const result = await claimWheelPrizeAction(prize);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (hasSpun) return null;

  return (
    <>
      <div 
        className="bg-kc-blush/20 border border-kc-rose-gold/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm cursor-pointer hover:bg-kc-blush/30 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm text-kc-rose-gold animate-bounce">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-kc-charcoal">¡Tienes un regalo de bienvenida!</h3>
            <p className="text-kc-mocha text-sm mt-1">Gira la ruleta Kelly's Rewards para ganar puntos extra o un descuento especial.</p>
          </div>
        </div>
        <button className="mt-4 md:mt-0 px-6 py-2 bg-kc-charcoal text-white rounded-full font-medium shadow-md hover:bg-kc-deep transition-all transform hover:scale-105 active:scale-95">
          Girar Ruleta
        </button>
      </div>

      <RewardsWheel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onPrizeWon={handlePrizeWon} 
      />
    </>
  );
}
