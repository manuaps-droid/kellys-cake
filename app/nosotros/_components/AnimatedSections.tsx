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
  { value: "15+", label: "Años de experiencia" },
  { value: "6,000+", label: "Clientes satisfechos" },
  { value: "4,000+", label: "Pasteles entregados" },
  { value: "4.9", label: "Calificación promedio" },
];

const values = [
  {
    icon: Heart,
    title: "Hecho con amor",
    desc: "Cada pastel lo preparamos como si fuera para nuestra propia familia. Ponemos alma en cada detalle.",
  },
  {
    icon: Award,
    title: "Excelencia artesanal",
    desc: "Ingredientes premium, técnicas de alta pastelería y un equipo apasionado por su oficio.",
  },
  {
    icon: Users,
    title: "Contigo en cada paso",
    desc: "Te acompañamos desde la idea hasta el último bocado. Tu visión es nuestra guía.",
  },
  {
    icon: Leaf,
    title: "Compromiso con la calidad",
    desc: "Seleccionamos cada insumo cuidando el sabor, la frescura y el impacto en nuestro entorno.",
  },
];

const timeline = [
  { year: "2009", event: "Kellys Cake abre sus puertas en una pequeña cocina en Arequipa." },
  { year: "2012", event: "Nuestra primera boda. 100 invitados, un pastel de 5 niveles y el amor como ingrediente secreto." },
  { year: "2015", event: "Lanzamos la línea de tortas personalizadas. Cada cliente se convierte en co-creador." },
  { year: "2021", event: "Nace nuestro sistema de personalización online para llegar a más hogares." },
  { year: "2026", event: "Más de 6,000 familias nos han elegido. Seguimos horneando sueños." },
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
          Desde 2009
        </span>

        <h1 className="mt-8 font-playfair text-6xl font-bold leading-tight text-white md:text-7xl">
          No solo hacemos
          <br />
          pasteles.{" "}
          <span className="text-amber-300">Creamos momentos.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-300">
          Durante más de 15 años, hemos tenido el privilegio de estar en las
          mesas de miles de familias arequipeñas. En cada cumpleaños, cada
          aniversario, cada celebración — ahí estábamos, con un pastel que
          contaba una historia.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/personalizar"
            className="rounded-full bg-amber-400 px-8 py-3.5 text-sm font-semibold text-[#1A0F0A] transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
          >
            Crea tu experiencia
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
              Kellys Cake nació en una pequeña cocina en Arequipa, con más
              ilusión que recursos. Lo que comenzó como un emprendimiento
              familiar se convirtió en un referente de la pastelería
              personalizada en Arequipa.
            </p>
            <p>
              No queremos ser la pastelería más grande. Queremos ser la que
              mejor entiende a sus clientes, la que convierte un pastel
              en un abrazo, una declaración de amor, una sorpresa
              inolvidable.
            </p>
            <p>
              Hoy, con más de 6,000 familias que han confiado en nosotros,
              seguimos horneando con la misma pasión del primer día. Cada
              pastel es único, porque cada historia lo es.
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
              años endulzando
              <br />
              momentos especiales
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
          convertido en quienes somos
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
          ¿Listo para crear
          <br />
          tu propia historia?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
          Cuéntanos qué celebración tienes en mente y te ayudaremos a crear
          un pastel tan único como el momento que vas a vivir.
        </p>
        <Link
          href="/personalizar"
          className="mt-10 inline-block rounded-full bg-amber-400 px-10 py-4 text-base font-semibold text-[#1A0F0A] transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
        >
          Comienza tu experiencia
        </Link>
      </motion.div>
    </section>
  );
}
