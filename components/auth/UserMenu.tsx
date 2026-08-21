"use client";

import Link from "next/link";

export default function UserMenu() {
  return (
    <Link
      href="/auth"
      className="flex items-center gap-2 font-semibold transition hover:text-[#D8B07A]"
    >
      <span className="text-xl">👤</span>
      <span>Mi Cuenta</span>
    </Link>
  );
}