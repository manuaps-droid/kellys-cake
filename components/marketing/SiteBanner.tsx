import AnnouncementBar from "./AnnouncementBar";

import type { MarketingConfig } from "@/features/admin/configuracion/validations/config.schema";

type Props = {
  config: NonNullable<MarketingConfig>;
};

/**
 * Banner promocional superior. Visible en toda la tienda cuando
 * `marketing.banner_activo = true`.
 *
 * Construye una lista de mensajes rotativos:
 *   1) El banner configurado por el admin (titulo + texto)
 *   2) "Envío gratis desde S/ X" si hay umbral configurado
 *   3) Mensajes estáticos de marketing
 *
 * Si el admin separa `banner_texto` con `|`, cada parte se convierte
 * en un mensaje independiente (perdiendo el título, que va solo en la
 * primera aparición).
 */
export default function SiteBanner({ config }: Props) {
  if (!config.banner_activo) return null;

  const mensajes: { texto: string; href?: string }[] = [];

  // 1) Banner configurado por el admin
  if (config.banner_titulo || config.banner_texto) {
    if (config.banner_texto.includes("|")) {
      // Modo multi-mensaje: cada parte separada por | es un slide
      const partes = config.banner_texto.split("|").map((p) => p.trim()).filter(Boolean);
      if (config.banner_titulo) {
        mensajes.push({
          texto: config.banner_titulo,
          href: config.banner_link || undefined,
        });
      }
      for (const parte of partes) {
        mensajes.push({ texto: parte, href: config.banner_link || undefined });
      }
    } else {
      const texto = [config.banner_titulo, config.banner_texto]
        .filter(Boolean)
        .join(" · ");
      mensajes.push({ texto, href: config.banner_link || undefined });
    }
  }

  // 2) Envío gratis por umbral
  if (config.envio_gratis_umbral) {
    mensajes.push({
      texto: `Envío gratis desde S/ ${config.envio_gratis_umbral}`,
      href: "/productos",
    });
  }

  // 3) Mensajes estáticos de marca
  mensajes.push({ texto: "Pastelería de autor · Cada pieza es única", href: "/personalizar" });
  mensajes.push({
    texto: "Cotización transparente en menos de 24h",
    href: "/personalizar",
  });
  mensajes.push({ texto: "Insumos de alta repostería · Puntualidad garantizada" });

  return (
    <AnnouncementBar
      messages={mensajes}
      color={config.banner_color || "#1A0F0A"}
    />
  );
}
