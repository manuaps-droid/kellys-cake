"use server";

import {
  createProductPresentationService,
  deleteProductPresentationService,
  getProductPresentationsService,
  updateProductPresentationService,
} from "../services/product-presentations.service";

import {
  CreateProductPresentationInput,
  UpdateProductPresentationInput,
} from "../types/product-presentation";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

async function assertAdmin() {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }
}

export async function getProductPresentationsAction(
  productoId: string
) {
  await assertAdmin();
  return getProductPresentationsService(productoId);
}

export async function createProductPresentationAction(
  input: CreateProductPresentationInput
) {
  await assertAdmin();
  return createProductPresentationService(input);
}

export async function updateProductPresentationAction(
  input: UpdateProductPresentationInput
) {
  await assertAdmin();
  return updateProductPresentationService(input);
}

export async function deleteProductPresentationAction(
  id: string
) {
  await assertAdmin();
  return deleteProductPresentationService(id);
}