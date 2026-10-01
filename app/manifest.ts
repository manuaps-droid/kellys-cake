import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kelly's Cake Admin",
    short_name: "KC Admin",
    description:
      "Panel de administración de Kelly's Cake — gestión de pedidos, productos, catering y más.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#FFFCF7",
    theme_color: "#2C1810",
    orientation: "portrait",
    categories: ["business", "food"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
