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

export async function getProductPresentationsAction(
  productoId: string
) {
  return getProductPresentationsService(productoId);
}

export async function createProductPresentationAction(
  input: CreateProductPresentationInput
) {
  return createProductPresentationService(input);
}

export async function updateProductPresentationAction(
  input: UpdateProductPresentationInput
) {
  return updateProductPresentationService(input);
}

export async function deleteProductPresentationAction(
  id: string
) {
  return deleteProductPresentationService(id);
}