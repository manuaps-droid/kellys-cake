import type { CartItem } from "../types/cart.types";

async function request<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || "Error al procesar el carrito."
    );
  }

  return response.json();
}

export const cartClient = {
  getItems() {
    return request<CartItem[]>("/api/cart");
  },

  addItem(
    productId: string,
    quantity = 1
  ) {
    return request<void>("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });
  },

  updateQuantity(
    itemId: string,
    quantity: number
  ) {
    return request<void>("/api/cart", {
      method: "PATCH",
      body: JSON.stringify({
        itemId,
        quantity,
      }),
    });
  },

  removeItem(itemId: string) {
    return request<void>("/api/cart", {
      method: "DELETE",
      body: JSON.stringify({
        itemId,
      }),
    });
  },

  clearCart() {
    return request<void>("/api/cart/clear", {
      method: "POST",
    });
  },
};