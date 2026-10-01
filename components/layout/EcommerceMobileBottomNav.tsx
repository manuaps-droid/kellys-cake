"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Sparkles, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";
import { useAuthContext } from "@/providers/AuthProvider";

export default function EcommerceMobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, openDrawer } = useCart();
  const { user } = useAuthContext();

  // No mostrar la barra en páginas de administración o foodos
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/foodos") ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      label: "Inicio",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/productos",
      label: "Tienda",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/productos"),
    },
    {
      href: "/personalizar",
      label: "Personaliza",
      icon: Sparkles,
      isActive: pathname.startsWith("/personalizar"),
    },
    {
      type: "button" as const,
      label: "Carrito",
      icon: ShoppingCart,
      badge: totalItems > 0 ? totalItems : undefined,
      onClick: openDrawer,
      isActive: false,
    },
    {
      href: user ? "/mi-cuenta" : "/auth/login",
      label: user ? "Cuenta" : "Ingresar",
      icon: User,
      isActive: pathname.startsWith("/mi-cuenta") || pathname.startsWith("/auth"),
    },
  ];

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-kc-sand/60 bg-kc-cream/95 backdrop-blur-xl lg:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 shadow-[0_-4px_20px_rgba(44,24,16,0.06)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;

          if (item.type === "button") {
            return (
              <button
                key={idx}
                type="button"
                onClick={item.onClick}
                className="group relative flex flex-1 flex-col items-center justify-center py-1 transition-colors text-kc-mocha hover:text-kc-rose-gold focus:outline-hidden"
              >
                <div className="relative">
                  <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  {item.badge != null && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-kc-rose-gold px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in duration-200">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
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
              className={`group flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                item.isActive
                  ? "text-kc-rose-gold font-semibold"
                  : "text-kc-mocha hover:text-kc-charcoal"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    item.isActive ? "scale-105 stroke-[2.5]" : ""
                  }`}
                />
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
  );
}
