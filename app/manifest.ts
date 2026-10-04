import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kelly's Cake",
    short_name: "Kelly's Cake",
    description:
      "Kelly's Cake — Tienda oficial de pastelería artesanal, FoodOS gastronómico y gestión de pedidos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFCF7",
    theme_color: "#2C1810",
    orientation: "portrait",
    categories: ["shopping", "food", "business"],
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
    shortcuts: [
      {
        name: "Tienda y Catálogo",
        short_name: "Tienda",
        description: "Catálogo de pasteles, presentaciones y pedidos",
        url: "/productos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "FoodOS Operativo",
        short_name: "FoodOS",
        description: "Sistema operativo gastronómico, producción y POS",
        url: "/foodos",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Panel de Administración",
        short_name: "Admin",
        description: "Gestión de pedidos, clientes y configuración",
        url: "/admin",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
