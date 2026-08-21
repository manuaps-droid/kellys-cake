import Link from "next/link";

import type { MarketingConfig } from "@/features/admin/configuracion/validations/config.schema";

type Props = {
  config: NonNullable<MarketingConfig>;
};

/**
 * Banner promocional superior. Visible en toda la tienda cuando
 * `marketing.banner_activo = true` y hay título/texto.
 */
export default function SiteBanner({ config }: Props) {
  if (!config.banner_activo) return null;
  if (!config.banner_titulo && !config.banner_texto) return null;

  const bg = config.banner_color || "#D8B07A";
  const fg = contrastColor(bg);

  const inner = (
    <div className="w-full px-4 py-2.5 text-center text-sm font-medium">
      <span style={{ color: fg }}>
        {config.banner_titulo && (
          <strong style={{ color: fg }}>{config.banner_titulo}</strong>
        )}
        {config.banner_titulo && config.banner_texto ? " · " : ""}
        {config.banner_texto}
      </span>
    </div>
  );

  return (
    <div
      style={{ backgroundColor: bg }}
      className="sticky top-0 z-30 w-full"
      role="region"
      aria-label="Promoción"
    >
      {config.banner_link ? (
        <Link href={config.banner_link} className="block w-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

// Calcula color de texto legible (negro o blanco) según la luminancia.
function contrastColor(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#1A0F0A";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1A0F0A" : "#FFFFFF";
}
