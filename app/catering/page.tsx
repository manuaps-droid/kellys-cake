import Navbar from "@/components/layout/Navbar";
import CateringHero from "@/features/catering/components/CateringHero";
import CateringServices from "@/features/catering/components/CateringServices";
import CateringGallery from "@/features/catering/components/CateringGallery";
import CateringForm from "@/features/catering/components/CateringForm";

export const metadata = {
  title: "Catering de Postres y Bocaditos para Eventos en Arequipa | Kelly's Cake",
  description:
    "Servicio de catering dulce y salado, mesas de postres y coffee break para bodas, cumpleaños y eventos corporativos en Arequipa. Cotización personalizada inmediata.",
  keywords: [
    "catering de postres arequipa",
    "bocaditos para eventos arequipa",
    "coffee break empresas arequipa",
    "mesas de dulces para matrimonios",
    "catering dulce arequipa",
  ],
  openGraph: {
    title: "Catering de Postres y Eventos en Arequipa | Kelly's Cake",
    description:
      "Mesas de dulces, bocaditos gourmet y tortas centrales para tus eventos más importantes en Arequipa.",
    type: "website",
    locale: "es_PE",
  },
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
