"use server";

import { getCartItems } from "../services/cart.service";

export async function getCartItemsAction() {
  try {
    const items =
      await getCartItems();

    return {
      success: true,
      items,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      items: [],
    };
  }
}