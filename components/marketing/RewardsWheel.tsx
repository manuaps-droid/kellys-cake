"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WheelPrize {
  label: string;
  value: number;
  type: 'puntos' | 'descuento' | 'otro';
  color: string;
}

const prizes: WheelPrize[] = [
  { label: '20 puntos', value: 20, type: 'puntos', color: '#C8956C' },
  { label: '5% dcto', value: 5, type: 'descuento', color: '#E8C4B8' },
  { label: '50 puntos', value: 50, type: 'puntos', color: '#D4A574' },
  { label: '10% dcto', value: 10, type: 'descuento', color: '#F5EDE4' },
  { label: '30 puntos', value: 30, type: 'puntos', color: '#8B7355' },
  { label: 'Delivery gratis', value: 0, type: 'otro', color: '#C8956C' },
  { label: '100 puntos', value: 100, type: 'puntos', color: '#D4A574' },
  { label: '15% dcto', value: 15, type: 'descuento', color: '#E8C4B8' },
];

interface RewardsWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onPrizeWon?: (prize: WheelPrize) => void;
}

export default function RewardsWheel({ isOpen, onClose, onPrizeWon }: RewardsWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  
  const spinWheel = () => {
    if (isSpinning || wonPrize) return;
    
    setIsSpinning(true);
    
    // Choose a random prize
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const selectedPrize = prizes[prizeIndex];
    
    // Calculate rotation: 5 full spins + degrees to the center of the chosen segment
    // Segment size is 360 / 8 = 45 degrees
    const segmentAngle = 360 / prizes.length;
    
    // Calculate the angle required to point the arrow (top) at the selected segment.
    // The top is 0 degrees. So we want the selected segment to be at 0/360 degrees when stopped.
    // Initial segment 0 is centered at 22.5 degrees if we start from 0 at the right/top depending on setup.
    // Let's assume standard orientation where index 0 is at top right.
    const targetAngle = 360 - (prizeIndex * segmentAngle);
    
    // Total rotation = current + 5 full circles + angle to land on target
    const newRotation = rotation + 360 * 5 + targetAngle - (rotation % 360) + (segmentAngle / 2);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
    }, 4000); // 4 seconds spin duration
  };

  const handleClaim = () => {
    if (wonPrize && onPrizeWon) {
      onPrizeWon(wonPrize);
    }
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setWonPrize(null);
      setRotation(0);
    }, 500);
  };

  // Generate conic gradient for the wheel
  const segmentSize = 100 / prizes.length;
  const gradientStops = prizes.map((prize, i) => {
    return `${prize.color} ${i * segmentSize}% ${(i + 1) * segmentSize}%`;
  }).join(', ');

  const wheelBackground = `conic-gradient(${gradientStops})`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-[#FFFCF7] rounded-3xl p-6 md:p-8 shadow-2xl max-w-lg w-full flex flex-col items-center border border-[#E8C4B8]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8B7355] hover:text-[#2C1810] transition-colors"
            >
              ✕
            </button>

            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#2C1810] mb-2 text-center">
              Kelly&apos;s Rewards
            </h2>
            <p className="text-[#8B7355] mb-8 text-center max-w-sm">
              {wonPrize ? "¡Ganaste!" : "Gira la ruleta y gana para tu próxima torta."}
            </p>

            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mb-8">
              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 text-[#2C1810]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 22h20L12 2z" />
                </svg>
              </div>

              {/* Wheel */}
              <motion.div
                className="w-full h-full rounded-full border-4 border-[#D4A574] shadow-inner relative overflow-hidden"
                style={{ background: wheelBackground }}
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: "easeOut" }}
              >
                {/* Labels */}
                {prizes.map((prize, i) => {
                  const angle = (i * 360) / prizes.length + (360 / prizes.length) / 2;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-start justify-center text-center font-bold"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <span 
                        className="mt-4 md:mt-8 block text-[#2C1810] text-xs md:text-sm transform rotate-90 origin-bottom w-24"
                        style={{ color: i % 2 === 0 ? '#FFFCF7' : '#2C1810' }}
                      >
                        {prize.label}
                      </span>
                    </div>
                  );
                })}
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-[#FFFCF7] rounded-full border-4 border-[#D4A574] z-10 flex items-center justify-center shadow-md">
                  <span className="font-[family-name:var(--font-playfair)] text-[#2C1810] font-bold text-xl md:text-2xl">K</span>
                </div>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {!wonPrize ? (
                <motion.button
                  key="spin-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="bg-[#2C1810] text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-[#8B7355] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  {isSpinning ? "Girando..." : "¡Gira la ruleta!"}
                </motion.button>
              ) : (
                <motion.div
                  key="claim-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="bg-[#FFF8F0] border border-[#D4A574] rounded-xl p-4 w-full text-center">
                    <span className="block text-3xl font-bold text-[#D4A574] mb-1">
                      {wonPrize.label}
                    </span>
                    <span className="text-[#8B7355] text-sm">
                      Se aplicará a tu cuenta
                    </span>
                  </div>
                  <button
                    onClick={handleClaim}
                    className="bg-[#D4A574] text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-[#C8956C] transition-colors shadow-lg w-full"
                  >
                    ¡Reclamar premio!
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
