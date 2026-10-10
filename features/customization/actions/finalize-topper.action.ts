"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/features/auth/services/auth.server";

import { resolveTopperPrecioService } from "../services/topper-price.service";
import { finalizeTopperService } from "../services/finalize-topper.service";

export type FinalizeTopperInput = {
  productoId: string;
  nombre: string;
  descripcion?: string;
  imagen: string;
  catalogoImagenId?: string;
};

/**
 * Finaliza el proyecto de topper: crea el pedido confirmado con
 * el topper incluido y lo envía a la agenda de producción.
 */
export async function finalizeTopperAction(input: FinalizeTopperInput) {
  const nombre = input.nombre?.trim();

  if (!nombre) {
    return {
      success: false,
      message: "Ingresa el nombre para tu topper.",
    };
  }

  if (!input.imagen || input.imagen.startsWith("blob:")) {
    return {
      success: false,
      message: "Selecciona un diseño para tu topper.",
    };
  }

  try {
    const { cliente } = await getCurrentClient();

    const precio = await resolveTopperPrecioService({
      productoId: input.productoId,
      catalogoImagenId: input.catalogoImagenId,
    });

    const pedido = await finalizeTopperService({
      clienteId: cliente.id,
      productoId: input.productoId,
      precio,
      nombre,
      descripcion: input.descripcion ?? nombre,
      imagen: input.imagen,
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/agenda");
    revalidatePath("/mi-cuenta/pedidos");

    return {
      success: true,
      orderId: pedido.id,
      numero: pedido.numero,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo finalizar el pedido del topper.",
    };
  }
}
