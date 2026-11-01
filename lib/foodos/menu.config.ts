import type { FoodosModulo } from "./modules";

/**
 * MENÚ DE FOODOS — única fuente de verdad.
 * El sidebar desktop (app/foodos/layout.tsx) y la navegación móvil
 * (components/foodos/FoodOSMobileNav.tsx) se generan de aquí.
 * Agregar un módulo = editar ESTE archivo únicamente.
 */

export type MenuBadgeEstilo =
  | "nuevo"
  | "ia"
  | "pro"
  | "contable"
  | "beta"
  | "sunat";

export type MenuItemConfig = {
  href: string;
  label: string;
  emoji: string;
  /** Clave para el icono lucide en móvil */
  iconKey: string;
  badge?: MenuBadgeEstilo;
  /** Módulo requerido (si no está activo, se muestra bloqueado) */
  modulo?: Exclude<FoodosModulo, "core">;
};

export type MenuSectionConfig = {
  id: string;
  titulo: string;
  items: MenuItemConfig[];
};

export const MENU_BADGE_CLASES: Record<MenuBadgeEstilo, string> = {
  nuevo: "bg-rose-500/90 text-white",
  ia: "bg-emerald-600 text-white",
  pro: "bg-kc-gold text-kc-deep",
  contable: "bg-kc-mocha text-white",
  beta: "bg-kc-blush/15 text-kc-blush border border-kc-blush/25",
  sunat: "bg-rose-600 text-white",
};

export const MENU_BADGE_TEXTO: Record<MenuBadgeEstilo, string> = {
  nuevo: "NUEVO",
  ia: "IA",
  pro: "PRO",
  contable: "CONTABLE",
  beta: "BETA",
  sunat: "SUNAT",
};

export const FOODOS_MENU: MenuSectionConfig[] = [
  {
    id: "core",
    titulo: "Módulo 1: Core",
    items: [
      {
        href: "/foodos",
        label: "Dashboard",
        emoji: "📊",
        iconKey: "dashboard",
      },
      {
        href: "/foodos/pulso",
        label: "Pulso del Negocio",
        emoji: "❤️",
        iconKey: "pulso",
        badge: "nuevo",
      },
      {
        href: "/foodos/prediccion",
        label: "Predicción de Demanda",
        emoji: "🔮",
        iconKey: "prediccion",
      },
      {
        href: "/foodos/ingredientes",
        label: "Ingredientes",
        emoji: "🥑",
        iconKey: "ingredientes",
      },
      {
        href: "/foodos/productos",
        label: "Productos & Recetas",
        emoji: "🍰",
        iconKey: "productos",
      },
      {
        href: "/foodos/compras/escanear",
        label: "Escanear Factura",
        emoji: "📷",
        iconKey: "escanear",
        badge: "ia",
      },
      {
        href: "/foodos/compras/nueva",
        label: "Ingresar Compra",
        emoji: "🛒",
        iconKey: "compras",
      },
      {
        href: "/foodos/eventos",
        label: "Eventos & Rentabilidad",
        emoji: "💰",
        iconKey: "eventos",
      },
      {
        href: "/foodos/rentabilidad",
        label: "Rentabilidad & Costos",
        emoji: "📈",
        iconKey: "rentabilidad",
        badge: "pro",
      },
      {
        href: "/foodos/contapro",
        label: "Importar Contapro",
        emoji: "🧮",
        iconKey: "contapro",
        badge: "contable",
      },
      {
        href: "/foodos/vending",
        label: "Máquinas Vending",
        emoji: "🤖",
        iconKey: "vending",
      },
      {
        href: "/foodos/copilot",
        label: "AI Copilot",
        emoji: "✨",
        iconKey: "copilot",
        badge: "beta",
      },
    ],
  },
  {
    id: "logistica",
    titulo: "Módulo 2: Logística",
    items: [
      {
        href: "/foodos/inventario",
        label: "Inventario & Stock",
        emoji: "📦",
        iconKey: "inventario",
        modulo: "logistica",
      },
      {
        href: "/foodos/produccion/nueva",
        label: "Hoja Producción",
        emoji: "👨‍🍳",
        iconKey: "produccion",
        modulo: "logistica",
      },
    ],
  },
  {
    id: "ventas",
    titulo: "Módulo 3: Ventas & SUNAT",
    items: [
      {
        href: "/foodos/ventas",
        label: "Punto de Venta (POS)",
        emoji: "🧾",
        iconKey: "pos",
        badge: "sunat",
        modulo: "ventas",
      },
      {
        href: "/foodos/cotizador/nueva",
        label: "Cotizador Catering",
        emoji: "📝",
        iconKey: "cotizador",
        modulo: "ventas",
      },
    ],
  },
];
