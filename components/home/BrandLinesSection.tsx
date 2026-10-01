import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";

const LINES = [
  {
    icon: "👑",
    tag: "El corazón de tu fiesta",
    title: "Pastelería Tradicional",
    description:
      "Nuestras recetas clásicas con fudge de olla cocinado a fuego lento, manjar artesanal y bizcochuelos húmedos esponjosos.",
    features: ["Tortas de cumpleaños", "Cheesecakes clásicos", "Bocaditos & Arma tu Caja"],
    href: "/productos",
    cta: "Explorar Tradicionales",
    bgGradient: "from-amber-50 to-orange-50/40",
    borderAccent: "border-amber-200/60",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    icon: "🌿",
    tag: "Dulzura consciente",
    title: "Línea Saludable & Ligera",
    description:
      "Diseñada para consentirte sin culpas. Opciones reducidas en azúcar, endulzadas naturalmente y con harinas integrales de calidad.",
    features: ["Bajas en azúcar / Alulosa", "Harinas de avena y frutos secos", "Sabor ligero sin pesadez"],
    href: "/productos?categoria=saludable",
    cta: "Ver Opciones Saludables",
    bgGradient: "from-emerald-50/50 to-teal-50/30",
    borderAccent: "border-emerald-200/60",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    icon: "🐾",
    tag: "100% Pet-Safe",
    title: "Celebración Pet",
    description:
      "Pack fiesta completo para tu engreído de cuatro patas. Ingredientes 100% naturales aprobados por nutrición canina y felina.",
    features: ["Torta pet + 2 pupcakes", "4 galletas temáticas", "Gorrito y velita festiva"],
    href: "/area-pets",
    cta: "Ver Pack Fiesta Pet",
    bgGradient: "from-rose-50/50 to-pink-50/30",
    borderAccent: "border-rose-200/60",
    badgeColor: "bg-rose-100 text-rose-800",
  },
];

export default function BrandLinesSection() {
  return (
    <section className="bg-white py-20 lg:py-24 border-t border-kc-sand/30">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Nuestras Tres Formas de Celebrar"
          subtitle="En Kelly's Cake cada integrante de la familia encuentra su porción soñada."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {LINES.map((line) => (
            <div
              key={line.title}
              className={`flex flex-col justify-between rounded-3xl border ${line.borderAccent} bg-gradient-to-br ${line.bgGradient} p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{line.icon}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${line.badgeColor}`}>
                    {line.tag}
                  </span>
                </div>

                <h3 className="mt-6 font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                  {line.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-kc-mocha">
                  {line.description}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-black/5 pt-5 text-xs text-kc-mocha">
                  {line.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <span className="text-kc-rose-gold font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={line.href}
                  className="inline-flex w-full items-center justify-center rounded-full bg-kc-charcoal px-6 py-3 text-xs font-semibold text-kc-cream transition-all hover:bg-kc-deep hover:shadow-lg"
                >
                  {line.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
