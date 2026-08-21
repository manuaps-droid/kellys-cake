import Badge from "@/components/ui/Badge";

import {
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/features/orders/constants/order-status";

import { getOrderStatusColor } from "@/features/orders/utils/get-order-status-color";

type StatusBadgeProps = {
  status: OrderStatus;
};

const variantMap = {
  gray: "default",
  green: "success",
  yellow: "warning",
  red: "danger",
  blue: "info",
  orange: "warning",
  purple: "info",
} as const;

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const color =
    getOrderStatusColor(status);

  const bg =
    color
      .split(" ")
      .find((c) => c.startsWith("bg-"))
      ?.replace("bg-", "")
      .replace("-100", "") ?? "gray";

  const variant =
    variantMap[
      bg as keyof typeof variantMap
    ] ?? "default";

  return (
    <Badge variant={variant}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}