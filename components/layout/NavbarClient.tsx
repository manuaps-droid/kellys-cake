"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";

import type { User } from "@supabase/supabase-js";

import { useAuthContext } from "@/providers/AuthProvider";
import { authClient } from "@/features/auth/services/auth.client";

import CartButton from "@/features/cart/components/CartButton";
import MobileMenuDrawer from "./MobileMenuDrawer";

type NavbarClientProps = {
  user: User | null;
  isAdmin?: boolean;
};

export default function NavbarClient({
  user: serverUser,
  isAdmin = false,
}: NavbarClientProps) {
  const { user: contextUser } = useAuthContext();
  const router = useRouter();
  const user = contextUser ?? serverUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Referencias estables: si onClose cambia en cada render, el
  // efecto del drawer que cierra al navegar se dispara solo y
  // el menú se cierra inmediatamente al abrirlo.
  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  async function handleLogout() {
    try {
      await authClient.signOut();
      closeMenu();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-kc-sand/60 bg-kc-cream backdrop-blur-xl">
        <div className="mx-auto flex h-20 lg:h-28 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/nuevo-logo.png"
              alt="Kelly's Cake"
              width={85}
              height={85}
              priority
              className="object-contain w-16 h-16 sm:w-20 sm:h-20 lg:w-[100px] lg:h-[100px]"
            />
          </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {[
            { label: "Inicio", href: "/" },
            { label: "Tienda Online", href: "/productos" },
            { label: "Área Pets", href: "/area-pets" },
            { label: "Personaliza", href: "/personalizar" },
            { label: "Catering", href: "/catering" },
            { label: "Nosotros", href: "/nosotros" },
            { label: "Contacto", href: "/contacto" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium tracking-wide text-kc-charcoal transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-kc-rose-gold after:transition-all after:duration-300 hover:text-kc-rose-gold hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full border border-kc-rose-gold/40 bg-kc-rose-gold/10 px-3 py-1 text-sm font-semibold text-kc-rose-gold transition-colors hover:bg-kc-rose-gold/20"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <CartButton />

          <div className="hidden lg:flex lg:items-center lg:gap-5">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-kc-charcoal">
                  {user.user_metadata?.full_name ?? user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-kc-mocha transition-colors hover:text-kc-rose-gold"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-kc-charcoal transition-colors hover:text-kc-rose-gold"
              >
                Mi Cuenta
              </Link>
            )}

            <Link
              href="/personalizar"
              className="rounded-full bg-kc-charcoal px-7 py-2.5 text-sm font-medium text-kc-cream transition-all duration-300 hover:bg-kc-deep hover:shadow-lg hover:shadow-kc-charcoal/20"
            >
              Cotizar
            </Link>
          </div>

          {/* Botón hamburguesa móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-kc-sand/60 bg-white text-kc-charcoal shadow-xs transition-colors hover:bg-kc-blush/30 hover:text-kc-rose-gold lg:hidden focus:outline-hidden"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

    <MobileMenuDrawer
      isOpen={mobileMenuOpen}
      onClose={closeMenu}
      user={user}
      isAdmin={isAdmin}
    />
  </>
  );
}
