import {
  getConfigRepository,
  updateConfigRepository,
} from "../repositories/config.repository";
import type { SeccionConfig } from "../validations/config.schema";

export async function getConfigService<T extends SeccionConfig>(
  seccion?: T
) {
  return getConfigRepository(seccion);
}

export async function updateConfigService<T extends SeccionConfig>(
  seccion: T,
  data: unknown
) {
  return updateConfigRepository(seccion, data);
}
