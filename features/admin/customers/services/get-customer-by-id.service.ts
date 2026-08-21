import { getCustomerByIdRepository } from "../repositories/get-customer-by-id.repository";

export async function getCustomerByIdService(
  id: string
) {
  return getCustomerByIdRepository(id);
}