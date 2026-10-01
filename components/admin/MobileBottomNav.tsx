"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Inicio", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/admin/agenda", label: "Agenda", icon: "📅" },
  { href: "/admin/catering", label: "Catering", icon: "🎂" },
  { href: "/admin/productos", label: "Más", icon: "⚙️" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-kc-sand/60 bg-kc-cream/95 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "text-kc-rose-gold"
                  : "text-kc-mocha hover:text-kc-charcoal"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
