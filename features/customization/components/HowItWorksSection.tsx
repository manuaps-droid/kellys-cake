import {
  Lightbulb,
  Images,
  CakeSlice,
} from "lucide-react";

import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";

export default function HowItWorksSection() {
  return (
    <Section>
      <SectionHeader
        title="¿Cómo funciona?"
        subtitle="Te cuento cómo es el proceso, paso por paso. En total, te toma menos de tres minutos."
      />

      <div className="mt-20 grid gap-10 lg:grid-cols-3">
        <StepCard
          icon={<Lightbulb size={36} />}
          number="01"
          title="Cuéntanos tu idea"
          description="Describe cómo te imaginas el pastel. No hace falta tenerlo todo pensado; con la idea general nos sobra para empezar."
        />

        <StepCard
          icon={<Images size={36} />}
          number="02"
          title="Muéstranos qué te inspira"
          description="Podrás subir hasta cuatro imágenes de referencia. Pueden ser fotografías de Pinterest, Instagram o cualquier imagen que te guste."
        />

        <StepCard
          icon={<CakeSlice size={36} />}
          number="03"
          title="Nos ponemos manos a la obra"
          description="Revisamos tu solicitud y te enviamos una propuesta con precios, tamaños y fechas. Sin compromiso."
        />
      </div>
    </Section>
  );
}

type StepCardProps = {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
};

function StepCard({
  icon,
  number,
  title,
  description,
}: StepCardProps) {
  return (
    <article className="group rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-[#FFF8F2] p-4 text-[#D8B07A]">
          {icon}
        </div>

        <span className="font-playfair text-4xl font-bold text-[#D8B07A]/30">
          {number}
        </span>
      </div>

      <h3 className="mt-8 text-2xl font-semibold text-[#0B1423]">
        {title}
      </h3>

      <p className="mt-5 leading-8 text-gray-600">
        {description}
      </p>
    </article>
  );
}