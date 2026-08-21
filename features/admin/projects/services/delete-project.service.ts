import { deleteProjectRepository } from "../repositories/delete-project.repository";

export async function deleteProjectService(
  id: string
) {
  return deleteProjectRepository(id);
}
