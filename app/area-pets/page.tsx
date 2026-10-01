import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AreaPetsContent from "./AreaPetsContent";

export const metadata: Metadata = {
  title: "Área Pets - Pack Celebración para Mascotas | Kelly's Cake",
  description:
    "Celebra el día especial de tu engreído con nuestro Pack Celebración Pet 100% natural y seguro. Torta pet-friendly, pupcakes y galletitas en Arequipa.",
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
