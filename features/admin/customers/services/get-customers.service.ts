import { getCustomersRepository, type GetCustomersFilters } from "../repositories/get-customers.repository";

export async function getCustomersService(
  filters?: GetCustomersFilters
) {
  return getCustomersRepository(filters ?? {});
}
