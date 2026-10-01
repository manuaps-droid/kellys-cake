import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import Section from "@/components/shared/Section";

export default function HeroSection() {
  return (
    <Section className="bg-[#FFF8F2]">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full bg-[#D8B07A]/10 px-4 py-2 text-sm font-semibold text-[#D8B07A]">
            Pastelería de Autor · Piezas Exclusivas
          </span>

          <h1 className="mt-8 font-playfair text-5xl font-bold leading-tight text-[#0B1423] md:text-6xl">
            Diseñamos la pieza central de tu celebración
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-600">
            Cada detalle cuenta. Tú defines la ocasión y tus ideas de inspiración; nosotros aportamos
            la técnica repostera, la armonía de sabores y una propuesta estética pensada para sorprender a tus invitados.
          </p>

          <div className="mt-10 space-y-4">
            <Benefit text="Diseño de autor exclusivo para tu evento" />
            <Benefit text="Sube hasta 4 imágenes de inspiración" />
            <Benefit text="Cotización detallada y 100% transparente" />
            <Benefit text="Puntualidad y entrega garantizada para tu fecha" />
          </div>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link
              href="/personalizar/nuevo"
              className="inline-flex items-center justify-center rounded-full bg-[#0B1423] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#1A2538]"
            >
              Comenzar mi diseño

              <ArrowRight
                size={20}
                className="ml-3"
              />
            </Link>

            <span className="text-sm text-gray-500">
              Solo te toma unos 3 minutos.
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[#D8B07A]/10 blur-3xl" />

          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-pink-100 blur-3xl" />

          <div className="overflow-hidden rounded-[40px] shadow-2xl">
            <Image
              src="/images/customization/hero.png"
              alt="Pastel personalizado Kelly's Cake"
              width={700}
              height={800}
              priority
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

type BenefitProps = {
  text: string;
};

function Benefit({
  text,
}: BenefitProps) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2
        size={22}
        className="text-[#D8B07A]"
      />

      <span className="text-lg text-gray-700">
        {text}
      </span>
    </div>
  );
}