import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AreaPetsContent from "./AreaPetsContent";

export const metadata: Metadata = {
  title: "Área Pet | Tortas para Perros y Gatitos con Delivery en Arequipa",
  description:
    "Pastelería canina y felina en Arequipa. Tortas de cumpleaños para perros y gatos elaboradas con ingredientes 100% naturales certificados, galletas temáticas y topper 3D.",
  keywords: [
    "tortas para perros arequipa",
    "pastelería canina arequipa",
    "torta cumpleaños perro arequipa",
    "pastelería pet delivery arequipa",
    "pack cumpleaños perro y gato",
    "galletas naturales para mascotas",
  ],
  openGraph: {
    title: "Área Pet | Pastelería Canina y Tortas para Mascotas en Arequipa",
    description:
      "Celebra el cumpleaños de tu perrito o gatito con tortas 100% naturales, galletas y topper especial de huellitas.",
    type: "website",
    locale: "es_PE",
  },
};

export default function AreaPetsPage() {
  return (
    <>
      <Navbar />
      <AreaPetsContent />
      <Footer />
    </>
  );
}
