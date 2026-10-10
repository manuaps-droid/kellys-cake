"use server";

import { getOrdersService } from "../services/get-orders.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

type GetOrdersFilters = {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
};

export async function getOrdersAction(
  filters?: GetOrdersFilters
) {
  if (!(await checkIsAdmin())) {
    return {
      success: false,
      orders: [],
      total: 0,
      perPage: filters?.perPage ?? 25,
      message: "No autorizado.",
    };
  }

  try {
    const { orders, total } =
      await getOrdersService(filters);

    return {
      success: true,
      orders,
      total,
      perPage: filters?.perPage ?? 25,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      orders: [],
      total: 0,
      perPage: filters?.perPage ?? 25,
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los pedidos.",
    };
  }
}
