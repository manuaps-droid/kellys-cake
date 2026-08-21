import { createProjectRepository } from "../repositories/create-project.repository";
import { ProjectData } from "../types/project.types";

export async function createProjectService(
  data: ProjectData
) {
  return createProjectRepository(data);
}