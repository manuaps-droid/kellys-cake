import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kellyscake.pe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/mi-cuenta",
        "/auth",
        "/carrito",
        "/checkout",
        "/cotizacion",
        "/foodos",
        "/cliente",
        "/autorizar-dispositivo",
        "/test",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
