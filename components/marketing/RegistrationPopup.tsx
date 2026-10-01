"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';

export default function RegistrationPopup() {
  const { user, loading } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check once loading is complete
    if (loading) return;

    // Don't show if user is logged in
    if (user) return;

    // Check if dismissed recently (within 24 hours)
    const dismissedTime = localStorage.getItem('kc_popup_dismissed');
    if (dismissedTime) {
      const now = new Date().getTime();
      const dismissedAt = parseInt(dismissedTime, 10);
      const hoursSinceDismiss = (now - dismissedAt) / (1000 * 60 * 60);
      
      if (hoursSinceDismiss < 24) {
        return;
      }
    }

    // Show after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('kc_popup_dismissed', new Date().getTime().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
            onClick={handleDismiss}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-[#E8C4B8]/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="h-2 w-full bg-gradient-to-r from-[#C8956C] via-[#D4A574] to-[#E8C4B8]" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-[#8B7355] hover:text-[#2C1810] hover:bg-[#F5EDE4] rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#2C1810] leading-tight mb-3">
                ¡Tu primera compra con 10% OFF!
              </h2>
              
              <p className="text-[#8B7355] text-sm md:text-base mb-6">
                Regístrate y llévate un 10% de descuento en tu primera
                compra, más 20 puntos de bienvenida en Kelly&apos;s Rewards.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-[#2C1810]">
                  <span className="text-xl">🎁</span>
                  <span>10% de descuento en tu primera compra</span>
                </li>
                <li className="flex items-center gap-3 text-[#2C1810]">
                  <span className="text-xl">⭐</span>
                  <span>20 puntos de bienvenida</span>
                </li>
                <li className="flex items-center gap-3 text-[#2C1810]">
                  <span className="text-xl">🎂</span>
                  <span>Sorpresa en tu cumpleaños</span>
                </li>
                <li className="flex items-center gap-3 text-[#2C1810]">
                  <span className="text-xl">🏆</span>
                  <span>Acceso al programa de rewards</span>
                </li>
              </ul>

              <div className="space-y-4">
                <Link 
                  href="/auth/register"
                  className="flex items-center justify-center w-full bg-[#D4A574] text-white py-3 px-6 rounded-xl font-medium text-lg hover:bg-[#C8956C] transition-colors shadow-md"
                  onClick={() => localStorage.setItem('kc_popup_dismissed', new Date().getTime().toString())}
                >
                  Crear mi cuenta
                </Link>
                
                <p className="text-center text-sm text-[#8B7355]">
                  ¿Ya tienes cuenta?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-medium text-[#D4A574] hover:text-[#2C1810] hover:underline transition-colors"
                    onClick={() => localStorage.setItem('kc_popup_dismissed', new Date().getTime().toString())}
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
