import { saveProductCatalogOptionsRepository } from "../repositories/save-product-catalog-options.repository";

export type ProductCatalogOptionInput = {
  catalogo_id: string;
  precio_extra: number;
  obligatorio: boolean;
};

export async function saveProductCatalogOptionsService(
  productId: string,
  options: ProductCatalogOptionInput[]
) {
  return await saveProductCatalogOptionsRepository(
    productId,
    options
  );
}