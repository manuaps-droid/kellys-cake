"use client";

import Image from "next/image";
import { useTransition } from "react";

import { Button } from "@/components/ui/Button";

import { increaseCartItemAction } from "../actions/increase-cart-item.action";
import { decreaseCartItemAction } from "../actions/decrease-cart-item.action";
import { removeCartItemAction } from "../actions/remove-cart-item.action";

import { useCart } from "../hooks/useCart";

import {
  getItemImagen,
  getItemNombre,
  getItemUnitPrice,
  type CartItem,
} from "../types/cart.types";

type Props = {
  item: CartItem;
};

export default function CartItemCard({
  item,
}: Props) {
  const [pending, startTransition] =
    useTransition();

  const {
    refreshCart,
  } = useCart();

  function increase() {
    startTransition(async () => {
      const result =
        await increaseCartItemAction(item.id);

      if (result.success) {
        await refreshCart();
      }
    });
  }

  function decrease() {
    startTransition(async () => {
      const result =
        await decreaseCartItemAction(item.id);

      if (result.success) {
        await refreshCart();
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result =
        await removeCartItemAction(item.id);

      if (result.success) {
        await refreshCart();
      }
    });
  }

  return (
    <div className="flex gap-5 rounded-2xl bg-white p-5 shadow">
      <div className="relative h-24 w-24 overflow-hidden rounded-xl">
        <Image
          src={
            getItemImagen(item) ??
            "/placeholder.jpg"
          }
          alt={getItemNombre(item)}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">
          {getItemNombre(item)}
        </h3>

        {item.presentacion && (
          <span className="mt-1 inline-block rounded-full bg-kc-blush/30 px-2.5 py-0.5 text-xs font-medium text-kc-mocha">
            {/^\d+$/.test(item.presentacion.nombre.trim())
              ? `${item.presentacion.nombre.trim()} unidades`
              : item.presentacion.nombre}
          </span>
        )}

        {item.descripcion && (
          <p className="mt-1 text-xs text-kc-mocha leading-relaxed line-clamp-2">
            {item.descripcion}
          </p>
        )}

        <p className="mt-1 text-gray-500">
          S/ {getItemUnitPrice(item).toFixed(2)}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={decrease}
            disabled={pending}
          >
            −
          </Button>

          <span className="min-w-8 text-center font-semibold">
            {item.cantidad}
          </span>

          <Button
            type="button"
            variant="outline"
            onClick={increase}
            disabled={pending}
          >
            +
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={remove}
            disabled={pending}
          >
            Eliminar
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-cake-gold">
          S/
          {" "}
          {(
            getItemUnitPrice(item) *
            item.cantidad
          ).toFixed(2)}
        </p>
      </div>
    </div>
  );
}