import {
  ORDER_STATUS,
  type OrderStatus,
} from "../constants/order-status";

export function getOrderStatusColor(
  status: OrderStatus
): string {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-700";

    case ORDER_STATUS.CONFIRMED:
      return "bg-blue-100 text-blue-700";

    case ORDER_STATUS.PREPARING:
      return "bg-orange-100 text-orange-700";

    case ORDER_STATUS.READY:
      return "bg-purple-100 text-purple-700";

    case ORDER_STATUS.DELIVERED:
      return "bg-green-100 text-green-700";

    case ORDER_STATUS.CANCELLED:
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}