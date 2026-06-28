"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logos/logo.png"
            alt="Kelly's Cake"
            width={150}
            height={70}
            priority
          />
        </Link>

        {/* Menú */}
        <nav className="hidden items-center gap-8 lg:flex">

          <Link href="/" className="font-medium hover:text-[#D8B07A] transition">
            Inicio
          </Link>

          <Link href="/productos" className="font-medium hover:text-[#D8B07A] transition">
            Productos
          </Link>

          <Link href="/galeria" className="font-medium hover:text-[#D8B07A] transition">
            Galería
          </Link>

          <Link href="/personalizar" className="font-medium hover:text-[#D8B07A] transition">
            Personaliza
          </Link>

          <Link href="/nosotros" className="font-medium hover:text-[#D8B07A] transition">
            Nosotros
          </Link>

          <Link href="/contacto" className="font-medium hover:text-[#D8B07A] transition">
            Contacto
          </Link>

        </nav>

        {/* Botones */}
        <div className="flex items-center gap-4">

          <Link
            href="/login"
            className="font-medium hover:text-[#D8B07A] transition"
          >
            Mi cuenta
          </Link>

          <Link
            href="/personalizar"
            className="rounded-full bg-[#0B1423] px-6 py-3 font-semibold text-white transition hover:bg-[#1A2538]"
          >
            Cotizar
          </Link>

        </div>

      </div>
    </header>
  );
}