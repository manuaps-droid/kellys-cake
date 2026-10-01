"use client";

import { motion } from "framer-motion";
import { Heart, Award, Users, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const stats = [
  { value: "15+", label: "Años metidos en esto" },
  { value: "6,000+", label: "Familias atendidas" },
  { value: "4,000+", label: "Pasteles entregados" },
  { value: "4.9", label: "Calificación promedio" },
];

const values = [
  {
    icon: Award,
    title: "Diseño de Autor",
    desc: "Cada pastel es concebido como una pieza única para tu celebración. Técnica profesional, proporciones exactas y estética cuidada.",
  },
  {
    icon: Users,
    title: "Transparencia Total",
    desc: "Cotizaciones detalladas y presupuestos claros desde el primer contacto. Sin costos ocultos ni sorpresas de último momento.",
  },
  {
    icon: Heart,
    title: "Puntualidad y Confianza",
    desc: "Tu evento es irrepetible y no espera. Nos comprometemos con rigor a entregar en la fecha y hora exactas pactadas.",
  },
  {
    icon: Leaf,
    title: "Insumos Certificados",
    desc: "Utilizamos insumos de alta repostería, chocolates de origen y frutas frescas seleccionadas para asegurar sabor y estructura perfecta.",
  },
];

const timeline = [
  { year: "2009", event: "Kellys Cake abre sus puertas en una pequeña cocina en Arequipa." },
  { year: "2012", event: "Nuestra primera boda. 100 invitados, un pastel de 5 niveles y bastante café de por medio." },
  { year: "2015", event: "Apostamos por las tortas personalizadas. El cliente se vuelve parte de la cocina." },
  { year: "2021", event: "Nace nuestro sistema de personalización online para llegar a más mesas." },
  { year: "2026", event: "Pasamos las 6,000 familias. La cocina sigue con el mismo cariño del primer día." },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] items-center bg-[#1A0F0A]">
      <Image
        src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1920&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F0A] via-[#1A0F0A]/80 to-transparent" />

      <motion.div {...fadeIn} className="relative z-10 mx-auto max-w-4xl px-6 py-32">
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400/80">
          Pastelería de autor · Desde 2009
        </span>

        <h1 className="mt-8 font-playfair text-6xl font-bold leading-tight text-white md:text-7xl">
          Cada pieza
          <br />
          cuenta una{" "}
          <span className="text-amber-300">historia.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-300">
          Llevamos más de 15 años diseñando las piezas centrales de las
          celebraciones arequipeñas. Cada pastel es una obra única, hecha
          con técnica profesional, ingredientes certificados y el compromiso
          de entregarlo perfecto. Así trabajamos, así nos conocen.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/personalizar"
            className="rounded-full bg-amber-400 px-8 py-3.5 text-sm font-semibold text-[#1A0F0A] transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
          >
            Quiero mi pastel
          </Link>

          <Link
            href="/contacto"
            className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Escríbenos
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export function StatsBanner() {
  return (
    <section className="relative -mt-20 z-20 mx-auto max-w-5xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid gap-px overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-2xl shadow-amber-200/50 md:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="bg-white/80 px-8 py-10 text-center backdrop-blur-sm">
            <p className="font-playfair text-4xl font-bold text-[#D8B07A]">{s.value}</p>
            <p className="mt-2 text-sm font-medium text-gray-500">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export function StorySection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-32">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
            Nuestra historia
          </span>

          <h2 className="mt-6 font-playfair text-4xl font-bold leading-tight text-[#1A0F0A]">
            Un sueño horneado
            <br />
            con paciencia
          </h2>

          <div className="mt-8 space-y-5 text-base leading-8 text-gray-600">
            <p>
              Kelly&apos;s Cake nació en una cocina familiar en Arequipa y evolucionó con los años
              hacia un taller de pastelería de autor especializado en piezas personalizadas para eventos
              inolvidables.
            </p>
            <p>
              Creemos que un momento importante no se puede improvisar. Por eso combinamos
              técnicas de alta repostería con procesos claros: diseño colaborativo, porciones exactas
              según tus invitados y presupuestos 100% transparentes.
            </p>
            <p>
              Más de 6,000 familias y celebraciones respaldan nuestro trabajo. Cada pieza
              que sale de nuestro taller lleva la firma de nuestro oficio y el compromiso de hacer
              que tu celebración luzca y sepa impecable.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1486427944299-d1955d23e344?w=900&q=80"
              alt="Pastel artesanal de Kellys Cake"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl">
            <p className="font-playfair text-3xl font-bold text-[#D8B07A]">15+</p>
            <p className="text-sm text-gray-500">
              años con algo
              <br />
              dulce en la mesa
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ValuesSection() {
  return (
    <section className="bg-[#FFF8F6] py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...fadeIn} className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
            Nuestra esencia
          </span>
          <h2 className="mt-4 font-playfair text-4xl font-bold text-[#1A0F0A]">Lo que nos define</h2>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group rounded-2xl bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-100/50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 transition-colors group-hover:bg-amber-100">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#1A0F0A]">{v.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-500">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-32">
      <motion.div {...fadeIn} className="text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
          Nuestra trayectoria
        </span>
        <h2 className="mt-4 font-playfair text-4xl font-bold text-[#1A0F0A]">
          Hitos que nos han
          <br />
          traído hasta aquí
        </h2>
      </motion.div>

      <div className="relative mt-20">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-200" />

        <div className="space-y-16">
          {timeline.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`relative flex items-center gap-8 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className={`w-5/12 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                <span className="font-playfair text-3xl font-bold text-[#D8B07A]">{t.year}</span>
                <p className="mt-2 text-base leading-7 text-gray-600">{t.event}</p>
              </div>
              <div className="absolute left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-amber-300 bg-white" />
              <div className="w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-[#1A0F0A] py-32">
      <motion.div {...fadeIn} className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-playfair text-5xl font-bold leading-tight text-white">
          ¿Listo para
          <br />
          tu pastel?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
          Cuéntanos qué celebras y te ayudamos a elegir. Sabor, relleno,
          diseño, tamaño: lo definimos entre los dos.
        </p>
        <Link
          href="/personalizar"
          className="mt-10 inline-block rounded-full bg-amber-400 px-10 py-4 text-base font-semibold text-[#1A0F0A] transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
        >
          Quiero empezar
        </Link>
      </motion.div>
    </section>
  );
}
