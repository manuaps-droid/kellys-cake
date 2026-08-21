import { getProjectsRepository } from "../repositories/get-projects.repository";

export async function getProjectsService() {
  return getProjectsRepository();
}