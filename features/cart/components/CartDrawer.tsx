"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";

import CartItemCard from "./CartItemCard";
import CartSummary from "./CartSummary";

import { useCart } from "../hooks/useCart";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({
  open,
  onClose,
}: Props) {
  const {
    items,
    loading,
  } = useCart();

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />

      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-cake-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b bg-white p-6">
          <h2 className="text-xl font-bold">
            Mi carrito
          </h2>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Cargando carrito...
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-center text-gray-500">
                Tu carrito está vacío.
              </p>

              <Link
                href="/productos"
                onClick={onClose}
              >
                <Button className="mt-6">
                  Ver productos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && items.length > 0 && (
          <div className="max-h-[48%] shrink-0 overflow-y-auto border-t border-gray-200 bg-cake-ivory">
            <CartSummary items={items} onClose={onClose} />
          </div>
        )}
      </aside>
    </>
  );
}