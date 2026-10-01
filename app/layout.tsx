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
import RegistrationPopup from "@/components/marketing/RegistrationPopup";
import EcommerceMobileBottomNav from "@/components/layout/EcommerceMobileBottomNav";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  getPublicSeo,
  getPublicMarketing,
  getPublicContacto,
} from "@/features/admin/configuracion/queries/public-config.query";

export type ProductoSugerido = {
  id: string;
  nombre: string;
  slug: string;
  precio: number | null;
  imagen_url: string | null;
};

// Producto destacado para sugerir en el carrito vacío.
// Prioriza "mas_vendido"; si no hay, el más reciente publicado.
async function getProductoSugerido(): Promise<ProductoSugerido | null> {
  try {
    const supabase = createAdminClient();

    const mapSugerido = (
      row: Record<string, unknown> | null
    ): ProductoSugerido | null => {
      if (!row) return null;
      const media = Array.isArray(row.media)
        ? (row.media as Array<{ url: string }>)[0]
        : (row.media as { url: string } | null);
      return {
        id: row.id as string,
        nombre: row.nombre as string,
        slug: row.slug as string,
        precio: (row.precio as number | null) ?? null,
        imagen_url: media?.url ?? null,
      };
    };

    const select = `
      id,
      nombre,
      slug,
      precio,
      media:imagen_principal_id (url)
    `;

    const destacado = await supabase
      .from("productos")
      .select(select)
      .eq("estado", "publicado")
      .eq("mas_vendido", true)
      .limit(1)
      .maybeSingle();

    if (destacado.data) {
      return mapSugerido(
        destacado.data as unknown as Record<string, unknown>
      );
    }

    const reciente = await supabase
      .from("productos")
      .select(select)
      .eq("estado", "publicado")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return mapSugerido(
      reciente.data as unknown as Record<string, unknown>
    );
  } catch {
    return null;
  }
}

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

  const title =
    seo?.title ?? "Kelly's Cake | Pastelería de Autor para Momentos que Importan";
  const description =
    seo?.description ??
    "Pastelería de autor en Arequipa. Diseñamos pasteles exclusivos para bodas, celebraciones y eventos especiales. Cotización transparente, insumos certificados y entrega puntual.";

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
  const [marketing, contacto, sugerido] = await Promise.all([
    getPublicMarketing(),
    getPublicContacto(),
    getProductoSugerido(),
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
      <body className="min-h-full flex flex-col pb-16 lg:pb-0">
        <AuthProvider>
          <CartProvider>
            {marketing?.banner_activo && <SiteBanner config={marketing} />}

            {children}

            <WhatsAppFloatingButton config={contacto} />
            {marketing?.popup_registro_activo !== false && <RegistrationPopup />}

            <EcommerceMobileBottomNav />

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
