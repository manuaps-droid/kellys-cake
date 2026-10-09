"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Award, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const HERO_IMAGES = [
  "/images/hero/wedding-cake.jpg",
  "/images/hero/cake-gold.jpg.png",
  "/images/hero/cake-white.jpg.png",
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-kc-cream">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--kc-blush)_0%,_transparent_50%)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--kc-sand)_0%,_transparent_50%)] opacity-40" />

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-10 px-4 py-8 sm:px-6 sm:py-16 lg:flex-row lg:gap-16 lg:py-28">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-block rounded-full border border-kc-rose-gold/30 bg-kc-rose-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-kc-rose-gold">
              Pastelería de autor
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-4 font-[family-name:var(--font-playfair)] text-5xl font-semibold leading-[1.1] tracking-tight text-kc-charcoal lg:text-7xl"
          >
            Cada celebración
            <br />
            <span className="bg-gradient-to-r from-kc-rose-gold via-kc-gold to-kc-rose-gold bg-clip-text text-transparent">merece un sabor perfecto</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-kc-mocha"
          >
            El centro de tus mejores recuerdos en Arequipa. Nuestras recetas tradicionales
            para tus grandes fiestas, junto a una cuidada línea saludable para consentirte sin culpas.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/productos"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-kc-charcoal px-8 py-4 text-sm font-bold text-white shadow-xl shadow-kc-charcoal/25 ring-2 ring-kc-rose-gold/70 transition-all duration-300 hover:scale-105 hover:bg-kc-deep hover:ring-kc-gold hover:shadow-2xl hover:shadow-kc-rose-gold/30 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Ver pastelería tradicional
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-kc-rose-gold via-kc-gold to-kc-rose-gold transition-transform duration-300 group-hover:translate-y-0" />
            </Link>

            <Link
              href="/personalizar"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-kc-rose-gold via-kc-gold to-kc-rose-gold px-8 py-4 text-sm font-bold text-white shadow-xl shadow-kc-rose-gold/35 ring-2 ring-white/60 transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-2xl hover:shadow-kc-rose-gold/50 active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
              <span>Personalizar mi pastel</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-14 flex gap-10"
          >
            {[
              { icon: Sparkles, label: "Diseño de autor, pieza única" },
              { icon: Award, label: "Insumos de alta repostería" },
              { icon: Clock, label: "Puntualidad garantizada" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-kc-rose-gold/20 bg-kc-rose-gold/10 transition-colors group-hover:bg-kc-rose-gold/20">
                  <item.icon className="h-4 w-4 text-kc-rose-gold" />
                </div>
                <span className="text-sm font-medium text-kc-charcoal">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <div className="relative">
            <div className="absolute -inset-4 sm:-inset-8 rounded-[2.5rem] bg-gradient-to-br from-kc-blush/30 via-kc-rose-gold/20 to-kc-sand/30 blur-2xl transition-all duration-500" />

            <div className="relative h-[320px] sm:h-[420px] lg:h-[500px] w-full overflow-hidden rounded-[2rem] bg-white/40 shadow-2xl shadow-kc-charcoal/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src={HERO_IMAGES[currentImage]}
                    alt="Pastel personalizado Kelly's Cake"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -bottom-4 left-4 sm:-left-6 rounded-2xl border border-white/40 bg-white/90 px-4 py-3 sm:px-6 sm:py-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex items-center gap-1 text-kc-gold text-xs sm:text-sm">
                {"★★★★★"}
              </div>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-kc-charcoal">
                +500 pasteles entregados solo este año
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

