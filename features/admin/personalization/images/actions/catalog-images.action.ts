"use server";

import {
  getCatalogImagesRepository,
  addCatalogImageRepository,
  deleteCatalogImageRepository,
  updateCatalogImageLabelRepository,
  updateCatalogImagePortadaRepository,
  setProductImageAsPortadaRepository,
  type CatalogImageRow,
} from "../repositories/catalog-images.repository";

export async function getCatalogImagesAction(
  catalogoId: string
): Promise<CatalogImageRow[]> {
  try {
    const data = await getCatalogImagesRepository(catalogoId);
    console.log("[DEBUG] getCatalogImagesAction:", catalogoId, "->", data.length, "imágenes");
    return data;
  } catch (error) {
    console.error("[DEBUG] Error en getCatalogImagesAction:", error);
    return [];
  }
}

export async function addCatalogImageAction(
  catalogoId: string,
  mediaId: string
) {
  try {
    await addCatalogImageRepository(catalogoId, mediaId);
    console.log("[DEBUG] addCatalogImageAction OK:", catalogoId, mediaId);
    return { success: true };
  } catch (error) {
    console.error("[DEBUG] Error en addCatalogImageAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}

export async function updateCatalogImageLabelAction(
  imageId: string,
  label: string
) {
  try {
    await updateCatalogImageLabelRepository(imageId, label);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}

export async function updateCatalogImagePortadaAction(
  catalogoId: string,
  imageId: string,
  esPortada: boolean
) {
  try {
    await updateCatalogImagePortadaRepository(catalogoId, imageId, esPortada);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}

export async function deleteCatalogImageAction(imageId: string) {
  try {
    await deleteCatalogImageRepository(imageId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}

export async function setProductImageAsPortadaAction(
  catalogoId: string,
  mediaId: string
) {
  try {
    await setProductImageAsPortadaRepository(catalogoId, mediaId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}
