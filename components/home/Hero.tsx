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

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 py-24 lg:flex-row lg:py-32">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 font-[family-name:var(--font-playfair)] text-5xl font-semibold leading-[1.1] tracking-tight text-kc-charcoal lg:text-7xl"
          >
            Compartimos tus
            <br />
            <span className="bg-gradient-to-r from-kc-rose-gold via-kc-gold to-kc-rose-gold bg-clip-text text-transparent">mejores momentos</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-kc-mocha"
          >
            Diseñamos experiencias gastronómicas visuales para bodas, aniversarios y celebraciones exclusivas. Donde cada detalle cuenta y cada sabor es una obra de arte.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/personalizar"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-kc-charcoal px-8 py-4 text-sm font-medium text-kc-cream transition-all duration-300 hover:bg-kc-deep hover:shadow-2xl hover:shadow-kc-charcoal/30"
            >
              <span className="relative z-10">Personalizar mi pastel</span>
              <div className="absolute inset-0 -z-10 translate-y-full bg-kc-rose-gold transition-transform duration-300 group-hover:translate-y-0" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-kc-rose-gold/40 px-8 py-4 text-sm font-medium text-kc-charcoal transition-all duration-300 hover:border-kc-rose-gold hover:bg-kc-rose-gold/5"
            >
              Ver catálogo
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-14 flex gap-10"
          >
            {[
              { icon: Sparkles, label: "Diseños únicos" },
              { icon: Award, label: "Ingredientes premium" },
              { icon: Clock, label: "Entregas puntuales" },
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

        <div className="flex-1">
          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-kc-blush/30 via-kc-rose-gold/20 to-kc-sand/30 blur-3xl transition-all duration-500" />

            <div className="relative h-[500px] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-kc-charcoal/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={HERO_IMAGES[currentImage]}
                    alt="Pastel personalizado Kelly's Cake"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -bottom-6 -left-6 rounded-2xl border border-white/40 bg-white/80 px-6 py-4 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center gap-1 text-kc-gold">
                {"★★★★★"}
              </div>
              <p className="mt-1 text-sm font-medium text-kc-charcoal">
                +500 experiencias inolvidables
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

