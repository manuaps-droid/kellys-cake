import type { Metadata } from "next";

import HeroSection from "@/features/customization/components/HeroSection";
import HowItWorksSection from "@/features/customization/components/HowItWorksSection";
import PersonalizationOptionsSection from "@/features/customization/components/PersonalizationOptionsSection";
import GallerySection from "@/features/customization/components/GallerySection";

export const metadata: Metadata = {
  title: "Tortas Personalizadas y de Autor en Arequipa | Kelly's Cake",
  description:
    "Diseñamos la torta de tus sueños para cumpleaños, bodas y aniversarios en Arequipa. Cotización transparente en 3 minutos, acabados de autor e ingredientes de primera calidad.",
  keywords: [
    "tortas personalizadas arequipa",
    "tortas de autor arequipa",
    "tortas tematicas cumpleaños",
    "cotizar torta personalizada arequipa",
    "tortas para bodas y matrimonios arequipa",
    "diseño de pasteles exclusivos",
  ],
  openGraph: {
    title: "Diseño de Tortas Personalizadas y de Autor en Arequipa | Kelly's Cake",
    description:
      "Convierte tu idea en la pieza central de tu celebración. Diseños exclusivos de tortas para momentos inolvidables.",
    type: "website",
    locale: "es_PE",
  },
};

export default function PersonalizarPage() {
  return (
    <>
      <HeroSection />

      <HowItWorksSection />

      <PersonalizationOptionsSection />

      <GallerySection />
    </>
  );
}