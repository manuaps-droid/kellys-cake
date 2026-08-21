"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { User } from "@supabase/supabase-js";

import { useAuthContext } from "@/providers/AuthProvider";
import { authClient } from "@/features/auth/services/auth.client";

import CartButton from "@/features/cart/components/CartButton";

type NavbarClientProps = {
  user: User | null;
};

export default function NavbarClient({ user: serverUser }: NavbarClientProps) {
  const { user: contextUser } = useAuthContext();
  const router = useRouter();
  const user = contextUser ?? serverUser;

  async function handleLogout() {
    try {
      await authClient.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-kc-sand/60 bg-kc-cream backdrop-blur-xl">
      <div className="mx-auto flex h-28 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logos/nuevo-logo.png"
            alt="Kelly's Cake"
            width={100}
            height={100}
            priority
            className="object-contain"
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
        </nav>

        <div className="flex items-center gap-5">
          <CartButton />

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
      </div>
    </header>
  );
}
