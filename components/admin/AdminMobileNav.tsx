"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  CalendarDays,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Users,
  CakeSlice,
  UtensilsCrossed,
  X,
  Eye,
  Smartphone,
  ChefHat,
} from "lucide-react";

import ActivarNotificaciones from "./ActivarNotificaciones";

const groups = [
  {
    title: "Contenido",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/catalogos", label: "Catálogos", icon: FolderOpen },
      { href: "/admin/productos", label: "Productos", icon: Package },
      { href: "/admin/categorias", label: "Categorías", icon: Tags },
      { href: "/admin/media", label: "Multimedia", icon: ImageIcon },
    ],
  },
  {
    title: "Ventas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/agenda", label: "Agenda de Producción", icon: CalendarDays },
      { href: "/admin/proyectos", label: "Proyectos", icon: CakeSlice },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/catering", label: "Catering", icon: UtensilsCrossed },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/visitas", label: "Visitas", icon: Eye },
      { href: "/admin/promociones", label: "Promociones", icon: Megaphone },
      { href: "/admin/contactos", label: "Contacto", icon: MessageSquare },
      { href: "/admin/reclamos", label: "Libro de Reclamos", icon: BookOpenText },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/configuracion", label: "Configuración", icon: Settings },
    ],
  },
];

const quickItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export default function AdminMobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const cerrarDrawer = () => setDrawerOpen(false);

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

  const estaActivo = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Barra inferior fija */}
      <nav
        aria-label="Navegación de administración móvil"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-cake-espresso/95 backdrop-blur-xl md:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2">
          {quickItems.map((item) => {
            const Icon = item.icon;
            const activo = estaActivo(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                  activo
                    ? "text-kc-rose-gold font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1 text-[11px] leading-none">
                  {item.label}
                </span>
                {activo && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-kc-rose-gold" />
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              drawerOpen
                ? "text-kc-rose-gold font-semibold"
                : "text-white/70 hover:text-white"
            }`}
            aria-label="Abrir menú de administración"
          >
            <Menu className="h-5 w-5" />
            <span className="mt-1 text-[11px] leading-none">Menú</span>
          </button>
        </div>
      </nav>

      {/* Cajón con todas las secciones */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 z-10 flex w-full max-w-xs flex-col overflow-y-auto border-r border-white/10 bg-cake-espresso text-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-cake-espresso p-4">
              <div>
                <h2 className="text-xl font-bold">
                  Kelly&apos;s Cake
                </h2>
                <p className="text-[11px] text-white/50">
                  Panel Administrativo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-3 text-sm">
              {groups.map((group) => (
                <div key={group.title}>
                  <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const activo = estaActivo(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={cerrarDrawer}
                          className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors ${
                            activo
                              ? "bg-white/10 font-semibold text-kc-rose-gold"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4">
                <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Equipo
                </div>
                <ActivarNotificaciones compacto />
                <Link
                  href="/autorizar-dispositivo"
                  onClick={cerrarDrawer}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Autorizar este equipo</span>
                </Link>
                <Link
                  href="/foodos"
                  onClick={cerrarDrawer}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <ChefHat className="h-4 w-4" />
                  <span>FoodOS · Producción</span>
                </Link>
                <Link
                  href="/"
                  onClick={cerrarDrawer}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Store className="h-4 w-4" />
                  <span>Ver tienda web</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
