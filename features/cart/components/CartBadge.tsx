"use client";

import { useCart } from "../hooks/useCart";

export default function CartBadge() {
  const { totalItems } = useCart();

  if (totalItems === 0) {
    return null;
  }

  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D8B07A] px-1 text-xs font-bold text-white">
      {totalItems}
    </span>
  );
}