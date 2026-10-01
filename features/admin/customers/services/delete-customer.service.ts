import { deleteCustomerRepository } from "../repositories/delete-customer.repository";

export async function deleteCustomerService(
  id: string
) {
  return deleteCustomerRepository(id);
}