import {
  createProductPresentationRepository,
  deleteProductPresentationRepository,
  getProductPresentationsRepository,
  updateProductPresentationRepository,
} from "../repositories/product-presentations.repository";

import {
  CreateProductPresentationInput,
  ProductPresentation,
  UpdateProductPresentationInput,
} from "../types/product-presentation";

export async function getProductPresentationsService(
  productoId: string
): Promise<ProductPresentation[]> {
  return getProductPresentationsRepository(productoId);
}

export async function createProductPresentationService(
  input: CreateProductPresentationInput
): Promise<ProductPresentation> {
  return createProductPresentationRepository(input);
}

export async function updateProductPresentationService(
  input: UpdateProductPresentationInput
): Promise<ProductPresentation> {
  return updateProductPresentationRepository(input);
}

export async function deleteProductPresentationService(
  id: string
): Promise<void> {
  return deleteProductPresentationRepository(id);
}