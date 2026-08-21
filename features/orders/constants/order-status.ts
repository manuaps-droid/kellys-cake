export const ORDER_STATUS = {
  PENDING: "pendiente",
  CONFIRMED: "confirmado",
  PREPARING: "produccion",
  READY: "listo",
  DELIVERED: "entregado",
  CANCELLED: "cancelado",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<
  OrderStatus,
  string
> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  produccion: "En preparación",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};