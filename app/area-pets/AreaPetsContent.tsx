"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const reasons = [
  {
    icon: "🐾",
    title: "100% Pet-Safe",
    description:
      "Ingredientes aptos para perros y gatos. Sin xilitol, chocolate ni uvas. Recetas naturales y seguras.",
  },
  {
    icon: "🧁",
    title: "Variedad Completa",
    description:
      "Pasteles, cupcakes, galletas decoradas y cake pops, todo en tamaño pet-friendly.",
  },
  {
    icon: "🎉",
    title: "Para Toda Ocasión",
    description:
      "Cumpleaños, adopción, Gotcha Day o simplemente porque se lo merece. Cada momento cuenta.",
  },
];

const productsPet = [
  {
    image: "/images/pets/dog-birthday.jpg",
    title: "Pastel de Cumpleaños",
    subtitle: "Personalizado con nombre y edad",
    price: "S/ 79",
  },
  {
    image: "/images/pets/pupcakes.jpg",
    title: "Pupcakes y Catcakes",
    subtitle: "Cupcakes individuales variados x6",
    price: "S/ 35",
  },
  {
    image: "/images/pets/dog-cookies.jpg",
    title: "Galletas Decoradas",
    subtitle: "Set de 12 galletas temáticas",
    price: "S/ 28",
  },
  {
    image: "/images/pets/cake-pops.jpg",
    title: "Cake Pops Pet-Friendly",
    subtitle: "Bolitas de pastel cubiertas x8",
    price: "S/ 32",
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
  return (
    <main className="flex-1">
      <style jsx global>{`
        @keyframes float-up {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.8s ease-out both;
        }
      `}</style>

      {/* HERO - Premium con gradiente */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-28">
        <FloatingPaws />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Texto */}
            <div className="animate-slide-in text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-kec-rose-gold/30 bg-white/60 px-4 py-1.5 text-sm font-medium text-kec-rose-gold backdrop-blur-sm">
                🐾 Nueva sección exclusiva
              </span>

              <h1 className="mt-8 font-[family-name:var(--font-playfair)] text-5xl font-semibold leading-[1.15] text-kec-charcoal lg:text-7xl">
                Porque Ellos También
                <br />
                <span className="bg-gradient-to-r from-kec-rose-gold via-kec-gold to-kec-rose-gold bg-clip-text text-transparent">
                  Merecen lo Mejor
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-kec-mocha lg:mx-0">
                Pastelería artesanal especializada en mascotas. Ingredientes naturales, recetas seguras y decoraciones increíbles que harán furor en el cumpleaños de tu mejor amigo.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link
                  href="/personalizar/nuevo"
                  className="inline-flex items-center gap-2 rounded-full bg-kec-charcoal px-8 py-4 text-sm font-medium text-kec-cream transition-all duration-300 hover:bg-kec-deep hover:shadow-2xl hover:shadow-kec-charcoal/30"
                >
                  🐾 Personalizar pastel para mascota
                </Link>
                <a
                  href="#productos"
                  className="inline-flex items-center gap-2 rounded-full border border-kec-rose-gold/40 bg-white px-8 py-4 text-sm font-medium text-kec-charcoal transition-all duration-300 hover:border-kec-rose-gold hover:bg-kec-rose-gold/5"
                >
                  Ver productos
                </a>
              </div>
            </div>

            {/* Imagen scottish-terrier */}
            <div className="animate-slide-in relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-kec-rose-gold/20 via-kec-gold/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-2xl shadow-kec-rose-gold/20">
                <Image
                  src="/images/pets/scottish-terrier.jpg"
                  alt="Scottish Terrier - Área Pets"
                  width={800}
                  height={800}
                  className="h-[320px] w-full object-contain sm:h-[400px] lg:h-[520px]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAZONES */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-kec-rose-gold">
              No es solo un pastel
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kec-charcoal">
              Es una experiencia para tu mascota
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className="group rounded-3xl border border-kec-sand/50 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-kec-rose-gold/10 text-4xl">
                  {r.icon}
                </div>
                <h3 className="mt-6 font-semibold text-kec-charcoal">
                  {r.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-kec-mocha">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS AREA PETS */}
      <section id="productos" className="bg-kec-ivory py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-kec-rose-gold">
              Menú Pet-Friendly
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kec-charcoal">
              Pastelería Premium para Mascotas
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {productsPet.map((p) => (
              <div
                key={p.title}
                className="group overflow-hidden rounded-2xl border border-kec-sand/50 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 overflow-hidden bg-kec-blush/20">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {p.image.includes("birthday") && "🎂"}
                    {p.image.includes("pupcakes") && "🧁"}
                    {p.image.includes("cookies") && "🍪"}
                    {p.image.includes("cake-pops") && "🍭"}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-kec-charcoal">{p.title}</h3>
                  <p className="mt-1 text-sm text-kec-mocha">{p.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-kec-rose-gold">{p.price}</span>
                    <Link
                      href="/personalizar/nuevo"
                      className="rounded-full bg-kec-charcoal px-4 py-1.5 text-xs font-medium text-kec-cream transition hover:bg-kec-deep"
                    >
                      Personalizar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-kec-deep to-kec-charcoal py-20">
        <FloatingPaws />
        <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
          <span className="text-6xl">🐾</span>
          <h2 className="mt-6 font-[family-name:var(--font-playfair)] text-4xl font-bold">
            Dale a Tu Mejor Amigo el Pastel que se Merece
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Ingredientes 100% seguros. Recetas naturales. Hecho con amor del bueno.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/personalizar/nuevo"
              className="inline-flex items-center gap-2 rounded-full bg-kec-rose-gold px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-kec-gold hover:shadow-2xl hover:shadow-kec-rose-gold/30"
            >
              🐾 Personalizar pastel para mascota
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Consultar por WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
