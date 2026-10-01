"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  ShoppingBag,
  Dog,
  Sparkles,
  UtensilsCrossed,
  Info,
  Mail,
  User as UserIcon,
  LogOut,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { authClient } from "@/features/auth/services/auth.client";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};

const navLinks = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Tienda Online", href: "/productos", icon: ShoppingBag },
  { label: "Área Pets", href: "/area-pets", icon: Dog },
  { label: "Personaliza tu pastel", href: "/personalizar", icon: Sparkles },
  { label: "Catering & Eventos", href: "/catering", icon: UtensilsCrossed },
  { label: "Nosotros", href: "/nosotros", icon: Info },
  { label: "Contacto", href: "/contacto", icon: Mail },
  { label: "Libro de Reclamaciones", href: "/libro-de-reclamaciones", icon: FileText },
];

export default function MobileMenuDrawer({ isOpen, onClose, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Cerrar al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevenir scroll en body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  async function handleLogout() {
    try {
      await authClient.signOut();
      onClose();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-kc-charcoal/60 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 w-full max-w-xs bg-kc-cream shadow-2xl flex flex-col justify-between overflow-y-auto z-10 transition-transform duration-300 ease-out border-r border-kc-sand/60">
        <div>
          {/* Header del Drawer */}
          <div className="flex items-center justify-between p-5 border-b border-kc-sand/60 bg-kc-cream/90 backdrop-blur-sm sticky top-0 z-10">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <Image
                src="/images/logos/nuevo-logo.png"
                alt="Kelly's Cake"
                width={70}
                height={70}
                className="object-contain"
              />
            </Link>
            <button
              onClick={onClose}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-kc-charcoal shadow-xs hover:bg-kc-blush/40 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Perfil del Usuario / Acceso */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-white/80 border border-kc-sand/50 shadow-xs">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kc-rose-gold/15 text-kc-rose-gold font-bold">
                    {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-kc-charcoal">
                      {user.user_metadata?.full_name ?? "Usuario"}
                    </p>
                    <p className="truncate text-[11px] text-kc-mocha">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-kc-sand/40 flex items-center justify-between text-xs">
                  <Link
                    href="/mi-cuenta"
                    onClick={onClose}
                    className="font-medium text-kc-rose-gold hover:underline flex items-center gap-1"
                  >
                    <span>Mi Panel</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-kc-mocha hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-kc-mocha">
                  Accede a tus pedidos y puntos Kelly&apos;s
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1 rounded-xl bg-kc-charcoal py-2 text-xs font-semibold text-kc-cream transition-colors hover:bg-kc-deep"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Ingresar</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={onClose}
                    className="flex items-center justify-center rounded-xl border border-kc-charcoal/20 bg-white py-2 text-xs font-semibold text-kc-charcoal transition-colors hover:bg-kc-cream"
                  >
                    <span>Registrarse</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Enlaces de Navegación */}
          <nav className="px-3 py-2 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-kc-rose-gold/15 text-kc-rose-gold font-semibold shadow-xs"
                      : "text-kc-charcoal hover:bg-white/60 hover:text-kc-rose-gold"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-kc-rose-gold text-white"
                        : "bg-kc-sand/40 text-kc-mocha"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CTA Inferior */}
        <div className="p-4 border-t border-kc-sand/60 bg-kc-cream/90 backdrop-blur-sm space-y-2">
          <Link
            href="/personalizar"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-full bg-kc-charcoal py-3 text-xs font-semibold text-kc-cream shadow-md transition-all hover:bg-kc-deep"
          >
            <Sparkles className="h-4 w-4 text-kc-rose-gold" />
            <span>Cotizar pastel exclusivo</span>
          </Link>
          <p className="text-[10px] text-center text-kc-mocha">
            Atención en Arequipa · Envíos con 24h de anticipación
          </p>
        </div>
      </aside>
    </div>
  );
}
