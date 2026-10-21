import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import BrandLinesSection from "@/components/home/BrandLinesSection";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellers from "@/components/home/BestSellers";
import HowItWorks from "@/components/home/HowItWorks";
import Footer from "@/components/layout/Footer";

import type { ContactoConfig } from "@/features/admin/configuracion/validations/config.schema";
import {
  getPublicTienda,
  getPublicContacto,
} from "@/features/admin/configuracion/queries/public-config.query";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kellyscake.pe";

export const metadata: Metadata = {
  title: "Tortas Personalizadas en Arequipa | Kelly's Cake",
  description:
    "Diseña y ordena tortas personalizadas de autor en Arequipa: pasteles para cumpleaños y bodas, toppers 3D con tu nombre, impresiones comestibles en papel de azúcar, área pet y delivery. Paga con Yape o Plin.",
  keywords: [
    "tortas personalizadas",
    "tortas personalizadas arequipa",
    "torta personalizada arequipa",
    "personalizar torta online",
    "tortas de autor arequipa",
    "pastelería de autor arequipa",
    "tortas para cumpleaños arequipa",
    "tortas para bodas arequipa",
    "pasteles personalizados arequipa",
    "tortas delivery arequipa",
    "comprar torta online arequipa",
    "toppers personalizados 3d arequipa",
    "bocaditos para eventos arequipa",
    "tortas para perros arequipa",
    "impresiones comestibles arequipa",
    "impresiones comestibles para tortas",
    "imprimir papel de azucar arequipa",
    "papel de arroz comestible arequipa",
    "impresion 3d toppers tortas arequipa",
    "figuras 3d para pasteleria arequipa",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tortas Personalizadas en Arequipa | Kelly's Cake",
    description:
      "Diseña tu torta personalizada de autor en Arequipa: pasteles para cumpleaños y bodas, toppers 3D, área pet y delivery. Paga con Yape o Plin.",
    type: "website",
    locale: "es_PE",
    url: "/",
  },
};

function rangoSchema(
  valor: string | undefined,
  dias: string
): string | null {
  const m = (valor ?? "").match(
    /(\d{1,2}:\d{2})\s*(?:a|-|–)\s*(\d{1,2}:\d{2})/
  );

  if (!m) return null;

  return `${dias} ${m[1]}-${m[2]}`;
}

export default async function Home() {
  const [tienda, contacto] = await Promise.all([
    getPublicTienda(),
    getPublicContacto(),
  ]);

  const c: Partial<ContactoConfig> = contacto ?? {};

  const nombre = tienda?.nombre ?? "Kelly's Cake";

  const telefono = (c.whatsapp || c.telefono || "").replace(
    /[^0-9]/g,
    ""
  );

  const socials = [
    c.instagram,
    c.facebook,
    c.tiktok,
    c.youtube,
  ].filter((s): s is string => Boolean(s));

  const horarios = [
    rangoSchema(c.horario_lunes_viernes, "Mo-Fr"),
    rangoSchema(c.horario_sabado, "Sa"),
  ].filter((h): h is string => h !== null);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}/#negocio`,
    name: nombre,
    url: SITE_URL,
    image: `${SITE_URL}/images/logos/nuevo-logo.png`,
    logo: `${SITE_URL}/images/logos/nuevo-logo.png`,
    telephone: telefono ? `+${telefono}` : undefined,
    priceRange: "S/",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Arequipa",
      addressRegion: "Arequipa",
      addressCountry: "PE",
      ...(c.direccion ? { streetAddress: c.direccion } : {}),
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(
        process.env.NEXT_PUBLIC_BAKERY_LAT ?? "-16.423017084298532"
      ),
      longitude: Number(
        process.env.NEXT_PUBLIC_BAKERY_LNG ?? "-71.51597134574365"
      ),
    },
    ...(horarios.length > 0 ? { openingHours: horarios } : {}),
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    servesCuisine:
      "Pastelería de autor, toppers en impresión 3D e impresiones comestibles en papel de azúcar",
    description:
      tienda?.descripcion ??
      "Pastelería de autor en Arequipa: tortas personalizadas para cumpleaños y bodas, toppers 3D, pastelería pet y delivery a domicilio.",
  };

  const websiteLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: nombre,
    alternateName: ["Kellys Cake", "Kelly's Cake Arequipa"],
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, websiteLd]),
        }}
      />

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
