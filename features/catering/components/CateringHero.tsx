"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CateringHero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-kc-deep via-kc-charcoal to-kc-deep" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(200,149,108,0.15),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(232,196,184,0.1),_transparent_50%)]" />
      
      {/* Floating decorative elements */}
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-kc-rose-gold/5 blur-3xl animate-pulse" />
      <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-kc-blush/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className={`relative z-10 mx-auto max-w-4xl px-6 text-center transition-all duration-1000 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}>
        <span className="inline-block rounded-full border border-kc-rose-gold/30 bg-kc-rose-gold/10 px-5 py-2 text-sm font-medium tracking-widest text-kc-rose-gold uppercase">
          Servicio Premium
        </span>

        <h1 className="mt-8 font-[family-name:var(--font-playfair)] text-5xl font-bold leading-tight text-kc-cream md:text-7xl">
          Catering para tus
          <span className="block bg-gradient-to-r from-kc-rose-gold to-kc-gold bg-clip-text text-transparent">
            eventos especiales
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-kc-cream/70">
          Creamos experiencias dulces inolvidables para cumpleaños, eventos corporativos y celebraciones especiales con pasteles artesanales de la más alta calidad.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#cotizar"
            className="group relative overflow-hidden rounded-full bg-kc-rose-gold px-10 py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-xl hover:shadow-kc-rose-gold/30"
          >
            <span className="relative z-10">🎂 Cumpleaños</span>
            <div className="absolute inset-0 bg-gradient-to-r from-kc-gold to-kc-rose-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </a>

          <a
            href="#cotizar"
            className="group rounded-full border-2 border-kc-cream/30 px-10 py-4 text-sm font-semibold tracking-wide text-kc-cream transition-all duration-300 hover:border-kc-rose-gold hover:bg-kc-rose-gold/10"
          >
            🏢 Corporativo
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-kc-cream to-transparent" />
    </section>
  );
}
