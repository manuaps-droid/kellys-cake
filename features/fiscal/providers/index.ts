import type { BillingProvider } from "./types";
import { NullBillingProvider } from "./null.provider";
import { SunatBillingProvider } from "./sunat.provider";

export type { ComprobanteInput, ComprobanteResultado, BillingProvider } from "./types";

/**
 * Factory: retorna el proveedor fiscal según la configuración
 * de la organización. Nunca lanza — siempre hay provider.
 */
export function getBillingProvider(
  proveedor?: string | null
): BillingProvider {
  switch (proveedor) {
    case "sunat":
      return new SunatBillingProvider();
    case "dian":
    case "sat":
      // TODO: implementar DIAN (Colombia) y SAT (México) al expandir
      return new NullBillingProvider();
    default:
      return new NullBillingProvider();
  }
}

export { NullBillingProvider, SunatBillingProvider };
