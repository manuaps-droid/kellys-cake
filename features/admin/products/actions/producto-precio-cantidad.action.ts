"use server";

import {
  getPreciosCantidadRepository,
  getPreciosCantidadByCatalogoRepository,
  upsertPreciosCantidadRepository,
  type PrecioCantidadRow,
} from "../repositories/producto-precio-cantidad.repository";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getPreciosCantidadAction(
  productoId: string
): Promise<PrecioCantidadRow[]> {
  if (!(await checkIsAdmin())) {
    return [];
  }

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
  if (!(await checkIsAdmin())) {
    return {};
  }

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
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

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
