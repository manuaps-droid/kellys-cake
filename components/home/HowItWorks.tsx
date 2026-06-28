import { MessageCircle, PencilRuler, Cake } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const steps = [
  {
    icon: MessageCircle,
    title: "1. Cuéntanos tu idea",
    description:
      "Cuéntanos para qué ocasión es el pastel y comparte una imagen de referencia si la tienes.",
  },
  {
    icon: PencilRuler,
    title: "2. Diseñamos tu pastel",
    description:
      "Te proponemos un diseño personalizado, el tamaño ideal y una cotización.",
  },
  {
    icon: Cake,
    title: "3. Disfruta tu celebración",
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

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8F2]">
                  <Icon className="h-8 w-8 text-[#D8B07A]" />
                </div>

                <h3 className="text-2xl font-semibold text-[#0B1423]">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
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