import type { Metadata } from "next";
import {
  Geist,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

import { cn } from "@/lib/utils";

import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/features/cart/context/CartProvider";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import SiteBanner from "@/components/marketing/SiteBanner";
import WhatsAppFloatingButton from "@/components/marketing/WhatsAppFloatingButton";

import {
  getPublicSeo,
  getPublicMarketing,
  getPublicContacto,
} from "@/features/admin/configuracion/queries/public-config.query";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// Metadata dinámica: lee desde la configuración de la tienda.
// `generateMetadata` corre en el servidor, una sola vez por
// request, paralelizable con el resto del render.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublicSeo();

  const title = seo?.title ?? "Kelly's Cake | Pasteles Personalizados de Alta Costura";
  const description =
    seo?.description ??
    "Creamos pasteles artesanales personalizados para bodas, cumpleaños y ocasiones especiales. Diseños únicos, ingredientes premium.";

  const ogImage = seo?.og_image_url ?? undefined;
  const verification = seo?.google_site_verification
    ? { other: { "google-site-verification": seo.google_site_verification } }
    : undefined;

  return {
    title,
    description,
    keywords: seo?.keywords ? seo.keywords.split(",").map((k) => k.trim()) : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_PE",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: ogImage
      ? { card: "summary_large_image", title, description, images: [ogImage] }
      : undefined,
    verification,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sin await: se ejecutan en paralelo con el render de children.
  const [marketing, contacto] = await Promise.all([
    getPublicMarketing(),
    getPublicContacto(),
  ]);

  return (
    <html
      lang="es"
      className={cn(
        "h-full",
        "antialiased",
        playfair.variable,
        poppins.variable,
        geist.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            {marketing?.banner_activo && <SiteBanner config={marketing} />}

            {children}

            <WhatsAppFloatingButton config={contacto} />

            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={3000}
            />

            <AnalyticsScripts />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
