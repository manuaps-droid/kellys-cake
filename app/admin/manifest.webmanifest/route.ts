const manifest = {
  name: "Kelly's Cake Admin",
  short_name: "KC Admin",
  description:
    "Panel de administración de Kelly's Cake: pedidos, agenda de producción, clientes, catálogos y configuración de la tienda.",
  id: "/admin",
  start_url: "/admin",
  scope: "/",
  display: "standalone",
  background_color: "#F7F8FA",
  theme_color: "#2C1810",
  orientation: "any",
  categories: ["business", "productivity"],
  icons: [
    {
      src: "/icons/icon-admin-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/icon-admin-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icons/icon-admin-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    {
      name: "Pedidos",
      short_name: "Pedidos",
      description: "Gestión de pedidos de la tienda",
      url: "/admin/pedidos",
      icons: [{ src: "/icons/icon-admin-192.png", sizes: "192x192" }],
    },
    {
      name: "Agenda de producción",
      short_name: "Agenda",
      description: "Programación semanal de producción",
      url: "/admin/agenda",
      icons: [{ src: "/icons/icon-admin-192.png", sizes: "192x192" }],
    },
    {
      name: "Clientes",
      short_name: "Clientes",
      description: "Base de clientes de la tienda",
      url: "/admin/clientes",
      icons: [{ src: "/icons/icon-admin-192.png", sizes: "192x192" }],
    },
  ],
};

export function GET() {
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
