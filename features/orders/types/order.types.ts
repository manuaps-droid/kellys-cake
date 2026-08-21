import type { OrderStatus } from "../constants/order-status";

export type OrderItem = {
  id: string;
  cantidad: number;
  precio: number;
  productos: {
    id: string;
    nombre: string;
    imagen: string;
  };
};

export type Order = {
  id: string;
  created_at: string;
  estado: OrderStatus;
  subtotal: number;
  envio: number;
  total: number;
  pedido_items: OrderItem[];
};