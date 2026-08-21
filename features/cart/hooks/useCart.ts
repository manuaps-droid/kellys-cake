"use client";

import { useContext } from "react";
import { CartContext } from "../context/CartProvider";

export function useCart() {
  const context = useContext(CartContext);

  console.log("useCart:", context);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }

  return context;
}