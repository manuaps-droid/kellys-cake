"use server";

import {
  getPreciosCantidadRepository,
  getPreciosCantidadByCatalogoRepository,
  upsertPreciosCantidadRepository,
  type PrecioCantidadRow,
} from "../repositories/producto-precio-cantidad.repository";

export async function getPreciosCantidadAction(
  productoId: string
): Promise<PrecioCantidadRow[]> {
  try {
    return await getPreciosCantidadRepository(productoId);
  } catch (error) {
    console.error("Error en getPreciosCantidadAction:", error);
    return [];
  }
}

export async function getPreciosCantidadByCatalogoAction(
  catalogoId: string
): Promise<Record<string, PrecioCantidadRow[]>> {
  try {
    return await getPreciosCantidadByCatalogoRepository(catalogoId);
  } catch (error) {
    console.error("Error en getPreciosCantidadByCatalogoAction:", error);
    return {};
  }
}

export async function savePreciosCantidadAction(
  productoId: string,
  tiers: Array<{ cantidad_minima: number; precio: number }>
) {
  try {
    await upsertPreciosCantidadRepository(productoId, tiers);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}
