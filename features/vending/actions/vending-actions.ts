"use server";

import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";
import { revalidatePath } from "next/cache";
import { vendingService } from "@/features/vending/services/vending.service";

export async function listarMaquinasVending() {
  await getFoodOSSession();

  try {
    const maquinas = await vendingService.listarMaquinas();
    return { success: true, maquinas };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al obtener máquinas.",
    };
  }
}

export async function crearMaquinaVending(input: {
  nombre: string;
  ubicacion: string;
  tipo_ubicacion?: string;
  formato?: string;
  capacidad_slots?: number;
}) {
  await getFoodOSSession();

  try {
    const nombre = (input.nombre ?? "").trim();
    const ubicacion = (input.ubicacion ?? "").trim();

    if (nombre.length < 2) {
      return { success: false, error: "Escribe el nombre de la máquina." };
    }
    if (ubicacion.length < 2) {
      return { success: false, error: "Escribe la ubicación de la máquina." };
    }

    const maquina = await vendingService.crearMaquina({
      nombre,
      ubicacion,
      tipo_ubicacion: input.tipo_ubicacion ?? "otro",
      formato: input.formato ?? "pantalla_tactil",
      capacidad_slots: Math.max(0, Number(input.capacidad_slots) || 0),
    });

    revalidatePath("/foodos/vending");
    return { success: true, maquina };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al crear la máquina.",
    };
  }
}

export async function eliminarMaquinaVending(id: string) {
  await getFoodOSSession();

  try {
    await vendingService.eliminarMaquina(id);
    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al eliminar la máquina.",
    };
  }
}

export async function actualizarMaquinaVending(
  id: string,
  datos: {
    nombre?: string;
    ubicacion?: string;
    formato?: string;
    capacidad_slots?: number;
    activo?: boolean;
  }
) {
  await getFoodOSSession();

  try {
    await vendingService.actualizarMaquina(id, datos);
    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al actualizar la máquina.",
    };
  }
}

export async function agregarInventarioVending(input: {
  maquina_id: string;
  producto_id: string;
  cantidad: number;
  precio_venta: number;
  costo_unitario: number;
}) {
  await getFoodOSSession();

  try {
    if (!input.maquina_id || !input.producto_id) {
      return { success: false, error: "Selecciona máquina y producto." };
    }

    await vendingService.agregarInventario(
      input.maquina_id,
      input.producto_id,
      Math.max(0, Number(input.cantidad) || 0),
      Math.max(0, Number(input.precio_venta) || 0),
      Math.max(0, Number(input.costo_unitario) || 0)
    );

    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al agregar inventario.",
    };
  }
}

export async function actualizarCantidadInventarioVending(
  id: string,
  cantidad: number
) {
  await getFoodOSSession();

  try {
    await vendingService.actualizarCantidadInventario(
      id,
      Math.max(0, Number(cantidad) || 0)
    );
    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al actualizar inventario.",
    };
  }
}

export async function eliminarInventarioVending(id: string) {
  await getFoodOSSession();

  try {
    await vendingService.eliminarInventario(id);
    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al eliminar inventario.",
    };
  }
}

export async function registrarVentaVending(input: {
  maquina_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}) {
  await getFoodOSSession();

  try {
    if (!input.maquina_id || !input.producto_id) {
      return { success: false, error: "Selecciona máquina y producto." };
    }

    await vendingService.registrarVenta(
      input.maquina_id,
      input.producto_id,
      Math.max(1, Number(input.cantidad) || 1),
      Math.max(0, Number(input.precio_unitario) || 0)
    );

    revalidatePath("/foodos/vending");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al registrar la venta.",
    };
  }
}

export async function listarVentasVending(
  maquinaId?: string,
  fechaInicio?: string,
  fechaFin?: string
) {
  await getFoodOSSession();

  try {
    const ventas = await vendingService.listarVentas(
      maquinaId,
      fechaInicio,
      fechaFin
    );
    return { success: true, ventas };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al obtener ventas.",
    };
  }
}

export async function listarMaquinasConResumenVending() {
  await getFoodOSSession();

  try {
    const maquinas = await vendingService.listarMaquinasConResumen();
    return { success: true, maquinas };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al obtener máquinas con resumen.",
    };
  }
}
