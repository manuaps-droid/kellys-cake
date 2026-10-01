import { getReferidosRepository } from "../repositories/get-referidos.repository";
import { createReferralCode, applyReferralCode } from "../repositories/create-referido.repository";
import { generateReferralCode } from "./generate-code.service";
import { Referido, ReferidoStats } from "../types/referido.types";

export async function getMisReferidos(
  clienteId: string
): Promise<{ referidos: Referido[]; stats: ReferidoStats }> {
  return getReferidosRepository(clienteId);
}

export async function generarCodigoReferido(
  clienteId: string
): Promise<{ success: boolean; codigo?: string; message?: string }> {
  try {
    const { stats } = await getMisReferidos(clienteId);
    if (stats.codigo) {
      return { success: true, codigo: stats.codigo };
    }

    const nuevoCodigo = await generateReferralCode();
    const created = await createReferralCode(clienteId, nuevoCodigo);

    if (!created) {
      return { success: false, message: "No se pudo crear el código de referido" };
    }

    return { success: true, codigo: nuevoCodigo };
  } catch (error) {
    console.error("Error en generarCodigoReferido:", error);
    return { success: false, message: "Error al generar código" };
  }
}

export async function aplicarCodigoReferido(
  codigo: string,
  nuevoClienteId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const aplicado = await applyReferralCode(codigo, nuevoClienteId);
    if (!aplicado) {
      return { success: false, message: "Código inválido, expirado o ya utilizado" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error en aplicarCodigoReferido:", error);
    return { success: false, message: "Error al aplicar el código" };
  }
}
