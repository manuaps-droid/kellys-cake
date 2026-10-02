import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import BrandLinesSection from "@/components/home/BrandLinesSection";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellers from "@/components/home/BestSellers";
import HowItWorks from "@/components/home/HowItWorks";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Kelly's Cake | Pastelería Fina, Tortas Personalizadas y Delivery en Arequipa",
  description:
    "Pastelería artesanal de autor en Arequipa. Diseñamos tortas personalizadas para cumpleaños y bodas, pastelería pet para perros y gatos, toppers en impresión 3D y delivery a domicilio.",
  keywords: [
    "tortas personalizadas arequipa",
    "pastelería fina arequipa",
    "tortas delivery arequipa",
    "comprar torta online arequipa",
    "tortas para perros arequipa",
    "toppers personalizados 3d arequipa",
    "bocaditos para eventos arequipa",
  ],
  openGraph: {
    title: "Kelly's Cake | Pastelería Fina, Tortas Personalizadas y Delivery en Arequipa",
    description:
      "Tortas temáticas de autor, bocaditos gourmet, área pet y toppers en impresión 3D con entrega puntual en Arequipa.",
    type: "website",
    locale: "es_PE",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <BrandLinesSection />
        <Categories />
        <FeaturedProducts />
        <BestSellers />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
