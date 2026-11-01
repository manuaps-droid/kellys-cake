"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Camera,
  ChefHat,
  Receipt,
  Layers,
  Sparkles,
  Package,
  ShoppingCart,
  DollarSign,
  FileSpreadsheet,
  Settings,
  Store,
  ChevronRight,
  TrendingUp,
  Calculator,
  HeartPulse,
  Type,
} from "lucide-react";
import {
  FOODOS_MENU,
  MENU_BADGE_CLASES,
  MENU_BADGE_TEXTO,
  type MenuItemConfig,
} from "@/lib/foodos/menu.config";

const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  pulso: HeartPulse,
  prediccion: TrendingUp,
  ingredientes: ShoppingCart,
  productos: Layers,
  escanear: Camera,
  compras: ShoppingCart,
  eventos: DollarSign,
  rentabilidad: TrendingUp,
  contapro: Calculator,
  vending: Package,
  copilot: Sparkles,
  inventario: Package,
  produccion: ChefHat,
  pos: Receipt,
  cotizador: FileSpreadsheet,
};

type Props = {
  modulosActivos: string[];
};

export default function FoodOSMobileNav({ modulosActivos }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Prevenir scroll en body al abrir cajón
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const tieneModulo = (m?: string) => !m || modulosActivos.includes(m);

  const quickNavItems = [
    {
      href: "/foodos",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/foodos",
    },
    {
      href: "/foodos/compras/escanear",
      label: "Escanear",
      icon: Camera,
      isActive: pathname.startsWith("/foodos/compras/escanear"),
      badge: "IA",
    },
    {
      href: "/foodos/prediccion",
      label: "Predicción",
      icon: TrendingUp,
      isActive: pathname.startsWith("/foodos/prediccion"),
    },
    {
      href: "/foodos/rentabilidad",
      label: "Rentabilidad",
      icon: Calculator,
      isActive: pathname.startsWith("/foodos/rentabilidad"),
    },
    {
      type: "button" as const,
      label: "Menú",
      icon: Layers,
      onClick: () => setDrawerOpen(true),
      isActive: drawerOpen,
    },
  ];

  return (
    <>
      {/* 1. Header Superior Móvil */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-white/10 bg-kc-deep px-4 md:hidden">
        <Link href="/foodos" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-kc-rose-gold">
            FoodOS<span className="text-kc-blush">.AI</span>
          </span>
          <span className="rounded-full bg-kc-rose-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-kc-rose-gold">
            MÓVIL
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-lg border border-kc-gold/30 bg-white/5 px-2.5 py-1 text-xs font-medium text-kc-cream/80 hover:text-kc-cream"
          >
            <Store className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Tienda</span>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-kc-gold/30 bg-white/5 text-kc-cream hover:bg-white/10"
            aria-label="Abrir menú de módulos"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 2. Barra Inferior Operativa Fija */}
      <nav
        aria-label="Navegación operativa FoodOS"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-kc-deep/95 backdrop-blur-xl md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2">
          {quickNavItems.map((item, idx) => {
            const Icon = item.icon;

            if ("onClick" in item && item.type === "button") {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.onClick}
                  className={`group flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                    item.isActive ? "text-kc-rose-gold" : "text-kc-cream/50 hover:text-kc-cream/80"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-1 text-[11px] font-medium leading-none">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                  item.isActive ? "text-kc-rose-gold font-bold" : "text-kc-cream/50 hover:text-kc-cream/80"
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {"badge" in item && item.badge && (
                    <span className="absolute -top-1 -right-3 rounded-full bg-emerald-500 px-1 py-0.2 text-[8px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[11px] leading-none">
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-kc-rose-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Cajón Deslizante (Slide-over Drawer) — generado desde menu.config.ts */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-kc-deep/80 backdrop-blur-xs transition-opacity duration-300"
            aria-hidden="true"
          />

          <aside
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-gradient-to-b from-kc-charcoal to-kc-deep text-kc-cream shadow-2xl flex flex-col justify-between overflow-y-auto z-10 border-r border-white/10"
          >
            <div>
              {/* Header Drawer */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-kc-charcoal/90 sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-kc-rose-gold">
                    FoodOS<span className="text-kc-blush">.AI</span>
                  </h2>
                  <p className="text-[10px] text-kc-cream/50">Panel Móvil Gastronómico</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-kc-cream/80 hover:bg-white/20"
                  aria-label="Cerrar menú"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Lista Completa de Módulos */}
              <nav className="p-3 space-y-4 text-xs">
                {FOODOS_MENU.map((seccion) => {
                  const desbloqueada = !seccion.items[0]?.modulo || modulosActivos.includes(seccion.items[0].modulo);

                  return (
                    <div key={seccion.id}>
                      <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest">
                        <span>{seccion.titulo}</span>
                        {!desbloqueada && <span>🔒</span>}
                      </div>
                      <div className="space-y-0.5">
                        {seccion.items.map((item: MenuItemConfig) => {
                          const activo = tieneModulo(item.modulo);
                          const Icon = ICONOS[item.iconKey] ?? Type;

                          if (!activo) {
                            return (
                              <Link
                                key={item.href}
                                href="/foodos/modulos"
                                className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-kc-cream/40 italic"
                              >
                                <span>{item.emoji} {item.label} bloqueado</span>
                                <span className="text-[10px] text-kc-rose-gold not-italic">Activar</span>
                              </Link>
                            );
                          }

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream ${
                                item.badge === "nuevo" || item.badge === "ia" || item.badge === "sunat" || item.badge === "pro"
                                  ? "font-semibold"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4 text-kc-rose-gold/80" />
                                <span>
                                  {item.emoji} {item.label}
                                </span>
                              </div>
                              {item.badge && (
                                <span className={`${MENU_BADGE_CLASES[item.badge]} rounded-full px-1.5 py-0.5 text-[9px] font-bold`}>
                                  {MENU_BADGE_TEXTO[item.badge]}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Footer Drawer */}
            <div className="p-3 border-t border-white/10 bg-kc-charcoal/90 space-y-2">
              <Link
                href="/foodos/modulos"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-kc-gold/25 bg-white/5 py-2.5 text-xs font-bold text-kc-blush hover:bg-white/10"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Gestionar Módulos</span>
              </Link>
              <Link
                href="/"
                className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-[11px] text-kc-cream/50 hover:text-kc-cream"
              >
                <div className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5" />
                  <span>Volver a Tienda Web</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
