"use client";

import { create } from "zustand";

type CartStore = {
  open: boolean;

  openCart: () => void;

  closeCart: () => void;
};

export const useCartStore =
  create<CartStore>((set) => ({
    open: false,

    openCart: () =>
      set({
        open: true,
      }),

    closeCart: () =>
      set({
        open: false,
      }),
  }));