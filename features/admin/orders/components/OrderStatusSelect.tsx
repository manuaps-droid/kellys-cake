"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/features/orders/constants/order-status";

import { updateOrderStatus } from "../actions/update-order-status.action";

type Props = {
  orderId: string;
  value: OrderStatus;
};

export default function OrderStatusSelect({
  orderId,
  value,
}: Props) {
  const [pending, startTransition] =
    useTransition();

  function handleChange(
    status: string
  ) {
    startTransition(async () => {
      const result =
        await updateOrderStatus(
          orderId,
          status as OrderStatus
        );

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo actualizar."
        );

        return;
      }

      toast.success(
        "Estado actualizado."
      );
    });
  }

  return (
    <Select
      defaultValue={value}
      onValueChange={handleChange}
      disabled={pending}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {Object.values(
          ORDER_STATUS
        ).map((status) => (
          <SelectItem
            key={status}
            value={status}
          >
            {
              ORDER_STATUS_LABEL[
                status
              ]
            }
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}