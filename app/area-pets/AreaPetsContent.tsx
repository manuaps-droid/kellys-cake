"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const WHATSAPP_PHONE = "51945262379";

const reasons = [
  {
    icon: "🐾",
    title: "100% Pet-Safe",
    description:
      "Recetas formuladas sin xilitol, sin chocolate, sin uvas ni cebolla. 100% apto para perritos y gatitos.",
  },
  {
    icon: "🥕",
    title: "Ingredientes Naturales",
    description:
      "Avena integral, puré de plátano, zanahoria fresca y frosting ligero a base de yogur deslactosado sin azúcar.",
  },
  {
    icon: "📦",
    title: "Todo en un Solo Pack",
    description:
      "Sin enredos ni complicaciones. Incluye pastelito, pupcakes, galletitas temáticas y accesorios de fiesta.",
  },
];

const packItems = [
  {
    icon: "🎂",
    title: "1x Pastelito Cumpleañero Pet (10 cm)",
    desc: "Bizcochuelo natural suave de avena, zanahoria y plátano, con frosting cremoso de yogur deslactosado sin azúcar y topper festivo.",
  },
  {
    icon: "🧁",
    title: "2x Pupcakes / Cupcakes Decorados",
    desc: "Porciones individuales ideales para consentirlo o compartir, decorados con toppings pet-friendly y figuras de huellita.",
  },
  {
    icon: "🦴",
    title: "4x Galletas Artesanales Crocantes",
    desc: "Horneadas con harina de avena y puré de manzana en forma de huesitos y huellas, ricas en fibra y textura crocante.",
  },
  {
    icon: "🎉",
    title: "1x Kit Festivo de Celebración",
    desc: "Gorrito temático de fiesta ajustable con elástico suave para la foto del recuerdo + velita decorativa.",
  },
];

function FloatingPaws() {
  const [paws, setPaws] = useState<
    { x: number; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    const arr = Array.from({ length: 8 }, () => ({
      x: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 20 + 10,
    }));
    setPaws(arr);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {paws.map((p, i) => (
        <span
          key={i}
          className="absolute animate-[float_6s_ease-in-out_infinite] opacity-10"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            top: `${Math.random() * 90}%`,
          }}
        >
          🐾
        </span>
      ))}
    </div>
  );
}

export default function AreaPetsContent() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    "¡Hola Kelly's Cake! 🐾 Me gustaría pedir el Pack Celebración para Mascotas (S/ 69). ¿Me ayudan con los detalles para mi engreído?"
  )}`;

  return (
    <main className="flex-1">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-20 lg:py-28">
        <FloatingPaws />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Texto Hero */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-kec-rose-gold/30 bg-white/70 px-4 py-1.5 text-sm font-medium text-kec-rose-gold backdrop-blur-sm shadow-sm">
                🐾 Área Pets · Kelly&apos;s Cake Arequipa
              </span>

              <h1 className="mt-6 font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.15] text-kec-charcoal">
                Celebra a tu Mascota
                <br />
                <span className="bg-gradient-to-r from-kec-rose-gold via-kec-gold to-kec-rose-gold bg-clip-text text-transparent">
                  con su Propia Fiesta
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-kec-mocha lg:mx-0">
                Una opción de celebración única, completa y 100% segura para perros y gatos. 
                Sin azúcar, sin sal ni ingredientes tóxicos: solo ingredientes naturales, sabor y cariño para su día más especial.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <a
                  href="#pack-celebracion"
                  className="inline-flex items-center gap-2 rounded-full bg-kec-charcoal px-7 py-3.5 text-sm font-medium text-kec-cream shadow-md transition-all duration-300 hover:bg-kec-deep hover:shadow-xl"
                >
                  🎉 Ver Pack Celebración (S/ 69)
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-kec-rose-gold/50 bg-white px-7 py-3.5 text-sm font-medium text-kec-charcoal shadow-sm transition-all duration-300 hover:border-kec-rose-gold hover:bg-kec-rose-gold/10"
                >
                  💬 Pedir por WhatsApp
                </a>
              </div>

              {/* Badges rápidos */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-kec-mocha lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">🥕</span> 100% Ingredientes Naturales
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">🚫</span> Cero Azúcar ni Sal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-base">📍</span> Hecho fresco en Arequipa
                </span>
              </div>
            </div>

            {/* Imagen Principal */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-kec-rose-gold/20 via-kec-gold/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-2xl shadow-kec-rose-gold/20">
                <Image
                  src="/images/pets/scottish-terrier.jpg"
                  alt="Mascota celebrando - Área Pets Kelly's Cake"
                  width={800}
                  height={800}
                  className="h-[300px] sm:h-[380px] lg:h-[460px] w-full object-contain"
                  priority
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/90 p-3.5 text-center shadow-lg backdrop-blur-md border border-kec-sand/40">
                  <p className="text-xs font-semibold text-kec-charcoal">
                    🐶 &quot;¡El festejo más esperado del año por fin es real!&quot;
                  </p>
                  <p className="text-[11px] text-kec-mocha">
                    Recetas balanceadas y aprobadas para su bienestar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRES PILARES */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-kec-rose-gold">
              Cuidado y Seguridad
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-kec-charcoal">
              Porque su Salud es lo Primero
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-kec-sand/50 bg-kec-ivory/30 p-7 text-center shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kec-rose-gold/10 text-3xl">
                  {r.icon}
                </div>
                <h3 className="mt-5 font-semibold text-lg text-kec-charcoal">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-kec-mocha">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EL PRODUCTO ÚNICO: PACK CELEBRACIÓN PET */}
      <section id="pack-celebracion" className="bg-gradient-to-b from-kec-ivory via-amber-50/40 to-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-kec-rose-gold/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-kec-rose-gold">
              ⭐ Opción Única de Celebración
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-kec-charcoal">
              Pack Celebración Pet
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-base text-kec-mocha">
              Simplificamos todo: un solo paquete listo con todo lo necesario para festejar a tu engreído en su día especial.
            </p>
          </div>

          {/* Tarjeta Destacada del Pack */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-kec-rose-gold/30 bg-white p-8 sm:p-12 shadow-2xl shadow-kec-rose-gold/15">
            {/* Ribbon destacado */}
            <div className="absolute top-6 right-6 hidden sm:block">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-kec-charcoal px-4 py-1.5 text-xs font-semibold text-kec-cream shadow-sm">
                🐾 Listo para Festejar
              </span>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 items-center">
              {/* Información y Desglose de lo que incluye */}
              <div className="lg:col-span-7">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-extrabold text-kec-charcoal">
                    S/ 69
                  </span>
                  <span className="text-sm font-medium text-kec-mocha">
                    / pack completo
                  </span>
                </div>

                <p className="mt-3 text-sm text-kec-mocha leading-relaxed">
                  Elaborado artesanalmente el mismo día de tu entrega con ingredientes frescos y 100% tolerados por perros y gatos.
                </p>

                <div className="mt-8 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-kec-charcoal">
                    ¿Qué incluye tu Pack Fiesta Pet?
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-1">
                    {packItems.map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-3.5 rounded-xl border border-kec-sand/40 bg-kec-ivory/40 p-4 transition hover:bg-kec-ivory/70"
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                        <div>
                          <h5 className="text-sm font-semibold text-kec-charcoal">
                            {item.title}
                          </h5>
                          <p className="mt-1 text-xs text-kec-mocha leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lado derecho: Resumen, Entrega y Botón de Pedido Directo */}
              <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 p-6 sm:p-8 border border-kec-sand/60 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md text-3xl">
                  🎁
                </div>

                <h4 className="mt-4 font-[family-name:var(--font-playfair)] text-xl font-bold text-kec-charcoal">
                  Pídelo Fácil por WhatsApp
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-kec-mocha">
                  Indícanos el nombre de tu mascota, la fecha de su festejo y si es perrito o gatito para preparar su kit personalizado.
                </p>

                <div className="my-5 border-t border-kec-sand/60 pt-4 space-y-2 text-left text-xs text-kec-mocha">
                  <div className="flex items-center gap-2">
                    <span className="text-kec-rose-gold font-bold">✓</span>
                    <span>Anticipación recomendada: <strong>24 a 48 hrs</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-kec-rose-gold font-bold">✓</span>
                    <span>Entrega a domicilio o recojo en Arequipa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-kec-rose-gold font-bold">✓</span>
                    <span>100% fresco, sin congelados ni químicos</span>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#20ba5a] hover:shadow-xl hover:scale-[1.02]"
                >
                  <span className="text-lg">💬</span> Pedir Pack Fiesta (S/ 69)
                </a>

                <p className="mt-3 text-[11px] text-gray-500">
                  Atención directa y confirmación inmediata en WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LO QUE SÍ LLEVA Y LO QUE NUNCA LLEVA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-kec-charcoal">
              Transparencia Total en Cada Bocado
            </h3>
            <p className="mt-2 text-sm text-kec-mocha">
              Nos tomamos la nutrición y seguridad de tu mascota con la máxima seriedad.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Sí lleva */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wide">
                <span>✅</span> Lo que SÍ utilizamos
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-emerald-950">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  Harina de avena integral molida (rica en fibra)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  Plátano maduro y zanahoria fresca rallada
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  Puré de manzana natural sin aditivos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  Frosting de yogur natural sin lactosa ni azúcares
                </li>
              </ul>
            </div>

            {/* NUNCA lleva */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-rose-800 uppercase tracking-wide">
                <span>❌</span> Lo que NUNCA utilizamos
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-rose-950">
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  0% Xilitol (edulcorante tóxico para mascotas)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  0% Chocolate, cacao o teobromina
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  0% Azúcar refinada, sal o levaduras químicas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  0% Cebolla, ajo, uvas ni colorantes artificiales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-kec-deep via-kec-charcoal to-black py-20 text-white">
        <FloatingPaws />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="text-5xl">🐾</span>
          <h2 className="mt-5 font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold">
            Haz que su cola no pare de moverse
          </h2>
          <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto">
            El Pack Celebración Pet llega fresco y listo para que le tomes las mejores fotos y disfrute su momento especial.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-kec-rose-gold px-8 py-4 text-sm font-semibold text-white shadow-xl transition-all hover:bg-kec-gold hover:scale-[1.02]"
            >
              🐾 Pedir Pack Fiesta Pet (S/ 69)
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Coordinamos la fecha y hora exacta de entrega en Arequipa vía WhatsApp
          </p>
        </div>
      </section>
    </main>
  );
}
