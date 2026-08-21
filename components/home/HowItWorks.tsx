import { MessageCircle, PencilRuler, Cake } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Cuéntanos tu idea",
    description:
      "Cuéntanos para qué ocasión es el pastel y comparte una imagen de referencia si la tienes.",
  },
  {
    icon: PencilRuler,
    number: "02",
    title: "Diseñamos tu pastel",
    description:
      "Te proponemos un diseño personalizado, el tamaño ideal y una cotización.",
  },
  {
    icon: Cake,
    number: "03",
    title: "Disfruta tu celebración",
    description:
      "Elaboramos tu pastel con ingredientes de calidad y lo entregamos listo para sorprender.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="¿Cómo funciona?"
          subtitle="Encargar tu pastel es muy fácil."
        />

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16.67%] right-[16.67%] top-24 hidden h-px bg-gradient-to-r from-transparent via-kc-rose-gold/30 to-transparent md:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-kc-sand/40 bg-kc-cream/50 p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-kc-rose-gold/30 hover:shadow-lg"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-kc-rose-gold/20 bg-kc-rose-gold/10">
                  <Icon className="h-7 w-7 text-kc-rose-gold" />
                </div>

                <span className="mb-3 inline-block font-[family-name:var(--font-playfair)] text-sm font-medium text-kc-rose-gold">
                  Paso {step.number}
                </span>

                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-kc-charcoal">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-kc-mocha">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
