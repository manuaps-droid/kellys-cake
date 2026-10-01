import Navbar from "@/components/layout/Navbar";
import CateringHero from "@/features/catering/components/CateringHero";
import CateringServices from "@/features/catering/components/CateringServices";
import CateringGallery from "@/features/catering/components/CateringGallery";
import CateringForm from "@/features/catering/components/CateringForm";

export const metadata = {
  title: "Catering | Kelly's Cake - Pasteles para Eventos",
  description: "Servicio de catering para cumpleaños, eventos corporativos y reuniones en Arequipa. Pide tu cotización y te la pasamos rápido.",
};

export default function CateringPage() {
  return (
    <>
      <Navbar />
      <CateringHero />
      <CateringServices />
      <CateringGallery />
      <CateringForm />
    </>
  );
}
