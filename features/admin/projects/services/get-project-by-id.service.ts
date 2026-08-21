import { getProjectByIdRepository } from "../repositories/get-project-by-id.repository";

export async function getProjectByIdService(id: string) {
  return getProjectByIdRepository(id);
}
