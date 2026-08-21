import { getFlavorsRepository } from "../repositories/flavor.repository";

export async function getFlavorsService() {
  return getFlavorsRepository();
}