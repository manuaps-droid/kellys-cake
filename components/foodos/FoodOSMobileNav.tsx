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
} from "lucide-react";

type Props = {
  tieneLogistica: boolean;
  tieneVentas: boolean;
};

export default function FoodOSMobileNav({
  tieneLogistica,
  tieneVentas,
}: Props) {
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
      href: tieneLogistica ? "/foodos/produccion/nueva" : "/foodos/modulos",
      label: "Producción",
      icon: ChefHat,
      isActive: pathname.startsWith("/foodos/produccion"),
    },
    {
      href: tieneVentas ? "/foodos/ventas" : "/foodos/modulos",
      label: "POS",
      icon: Receipt,
      isActive: pathname.startsWith("/foodos/ventas"),
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

            if (item.type === "button") {
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
                  {item.badge && (
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

      {/* 3. Cajón Deslizante (Slide-over Drawer) con todos los Módulos */}
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
                {/* CORE */}
                <div>
                  <div className="px-2 pb-1 text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest">
                    Módulo 1: Core Operativo
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/foodos"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                    >
                      <LayoutDashboard className="h-4 w-4 text-kc-rose-gold" />
                      <span>Dashboard & Rentabilidad</span>
                    </Link>
                    <Link
                      href="/foodos/pulso"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-rose-300 font-semibold hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <HeartPulse className="h-4 w-4" />
                        <span>Pulso del Negocio</span>
                      </div>
                      <span className="rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        NUEVO
                      </span>
                    </Link>
                    <Link
                      href="/foodos/ingredientes"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                    >
                      <span className="text-sm">🥑</span>
                      <span>Ingredientes & Costos</span>
                    </Link>
                    <Link
                      href="/foodos/productos"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                    >
                      <span className="text-sm">🍰</span>
                      <span>Productos & Recetas</span>
                    </Link>
                    <Link
                      href="/foodos/compras/escanear"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-emerald-300 font-semibold hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <Camera className="h-4 w-4" />
                        <span>Escanear Factura</span>
                      </div>
                      <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        IA
                      </span>
                    </Link>
                    <Link
                      href="/foodos/compras/nueva"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/70 hover:bg-white/10 hover:text-kc-cream"
                    >
                      <ShoppingCart className="h-4 w-4 text-kc-cream/50" />
                      <span>Ingresar Compra Manual</span>
                    </Link>
                    <Link
                      href="/foodos/eventos"
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-gold hover:text-kc-blush hover:bg-white/10"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Eventos & Costeo</span>
                    </Link>
                    <Link
                      href="/foodos/rentabilidad"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-emerald-300 font-semibold hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="h-4 w-4" />
                        <span>Simulador Rentabilidad</span>
                      </div>
                      <span className="rounded-full bg-kc-gold px-1.5 py-0.5 text-[9px] font-bold text-kc-deep">
                        PRO
                      </span>
                    </Link>
                    <Link
                      href="/foodos/contapro"
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 text-kc-cream/80 font-semibold hover:bg-white/10 hover:text-kc-cream"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calculator className="h-4 w-4" />
                        <span>Importar Contapro</span>
                      </div>
                      <span className="rounded-full bg-kc-mocha px-1.5 py-0.5 text-[9px] font-bold text-white">
                        CONTABLE
                      </span>
                    </Link>
                    <Link
                      href="/foodos/copilot"
                      className="flex items-center justify-between rounded-xl border border-kc-blush/25 px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-kc-blush" />
                        <span>AI Copilot</span>
                      </div>
                      <span className="rounded-full bg-kc-blush/15 px-1.5 py-0.5 text-[9px] font-bold text-kc-blush">
                        BETA
                      </span>
                    </Link>
                  </div>
                </div>

                {/* LOGÍSTICA */}
                <div>
                  <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest">
                    <span>Módulo 2: Logística</span>
                    {!tieneLogistica && <span>🔒</span>}
                  </div>
                  <div className="space-y-0.5">
                    {tieneLogistica ? (
                      <>
                        <Link
                          href="/foodos/inventario"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-gold hover:text-kc-blush hover:bg-white/10"
                        >
                          <Package className="h-4 w-4" />
                          <span>Inventario & Stock</span>
                        </Link>
                        <Link
                          href="/foodos/produccion/nueva"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                        >
                          <ChefHat className="h-4 w-4 text-kc-gold" />
                          <span>Hoja de Producción</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/foodos/modulos"
                        className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-kc-cream/40 italic"
                      >
                        <span>Inventario Bloqueado</span>
                        <span className="text-[10px] text-kc-rose-gold not-italic">Activar</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* VENTAS */}
                <div>
                  <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest">
                    <span>Módulo 3: Ventas & SUNAT</span>
                    {!tieneVentas && <span>🔒</span>}
                  </div>
                  <div className="space-y-0.5">
                    {tieneVentas ? (
                      <>
                        <Link
                          href="/foodos/ventas"
                          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-rose-300 font-bold hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2.5">
                            <Receipt className="h-4 w-4" />
                            <span>Punto de Venta (POS)</span>
                          </div>
                          <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            SUNAT
                          </span>
                        </Link>
                        <Link
                          href="/foodos/cotizador/nueva"
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-kc-cream/80 hover:bg-white/10 hover:text-kc-cream"
                        >
                          <FileSpreadsheet className="h-4 w-4 text-kc-rose-gold" />
                          <span>Cotizador Catering</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/foodos/modulos"
                        className="flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-2 text-kc-cream/40 italic"
                      >
                        <span>Facturación Bloqueada</span>
                        <span className="text-[10px] text-kc-rose-gold not-italic">Activar</span>
                      </Link>
                    )}
                  </div>
                </div>
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
