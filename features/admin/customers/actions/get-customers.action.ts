"use server";

import { getCustomersService } from "../services/get-customers.service";

type GetCustomersFilters = {
  search?: string;
  page?: number;
  perPage?: number;
};

export async function getCustomersAction(
  filters?: GetCustomersFilters
) {
  try {
    const { customers, total } =
      await getCustomersService(filters);

    return {
      success: true,
      customers,
      total,
      perPage: filters?.perPage ?? 25,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      customers: [],
      total: 0,
      perPage: filters?.perPage ?? 25,
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los clientes.",
    };
  }
}
