"use client";

import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/Button";

import CartBadge from "./CartBadge";
import CartDrawer from "./CartDrawer";

import { useCart } from "../hooks/useCart";

export default function CartButton() {
  const {
    drawerOpen,
    openDrawer,
    closeDrawer,
  } = useCart();

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={openDrawer}
        >
          <ShoppingCart size={22} />
        </Button>

        <CartBadge />
      </div>

      <CartDrawer
        open={drawerOpen}
        onClose={closeDrawer}
      />
    </>
  );
}