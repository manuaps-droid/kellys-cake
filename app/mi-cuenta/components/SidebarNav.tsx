"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Package, Award, Users, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/mi-cuenta", icon: Home },
  { name: "Mis Pedidos", href: "/mi-cuenta/pedidos", icon: Package },
  { name: "Mis Rewards", href: "/mi-cuenta/rewards", icon: Award },
  { name: "Mis Referidos", href: "/mi-cuenta/referidos", icon: Users },
  { name: "Mi Perfil", href: "/mi-cuenta/perfil", icon: User },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Nav (Scrollable) */}
      <div className="lg:hidden flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2 mb-6 snap-x">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/mi-cuenta" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start",
                isActive
                  ? "bg-kc-blush/20 text-kc-charcoal border border-kc-rose-gold/30"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-kc-ivory"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col space-y-1 bg-white p-4 rounded-2xl shadow-sm border border-kc-ivory/50">
        <h2 className="text-lg font-playfair font-bold text-kc-charcoal mb-4 px-4 pt-2">Mi Cuenta</h2>
        <nav className="flex flex-col space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/mi-cuenta" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-l-4",
                  isActive
                    ? "bg-kc-blush/20 text-kc-charcoal border-kc-rose-gold shadow-sm"
                    : "text-gray-600 border-transparent hover:bg-kc-ivory hover:text-kc-charcoal hover:border-kc-rose-gold/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-kc-rose-gold" : "text-gray-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
