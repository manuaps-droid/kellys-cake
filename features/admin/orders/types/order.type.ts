export type AdminOrderStatus =
  | "pendiente"
  | "confirmado"
  | "produccion"
  | "listo"
  | "entregado"
  | "cancelado";

export interface AdminOrderProduct {
  id: string;

  nombre: string;

  descripcion: string | null;

  imagen: string;

  precio: number;
}

export interface AdminOrderItem {
  id: string;

  cantidad: number;

  precio: number;

  productos: AdminOrderProduct;
}

export interface AdminOrderCustomer {
  id: string;

  nombre: string;

  correo?: string | null;

  celular?: string | null;
}

export interface AdminOrder {
  id: string;

  numero: number | null;

  created_at: string;

  estado: AdminOrderStatus;

  subtotal: number;

  envio: number;

  total: number;

  observaciones?: string | null;

  direccion?: string | null;

  metodo_pago?: string | null;

  tipo_pago?: string | null;

  monto_pagado?: number | null;

  referencia_pago?: string | null;

  estado_pago?: string | null;

  fecha_entrega?: string | null;

  hora_entrega?: string | null;

  tipo_entrega?: string | null;

  cliente: AdminOrderCustomer;

  pedido_items: AdminOrderItem[];

  webhook_pago?: {
    fuente: string;
    status: string;
    external_reference: string;
    payment_id: string | null;
    created_at: string;
  } | null;
}