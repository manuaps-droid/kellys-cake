import type {
  BillingProvider,
  ComprobanteInput,
  ComprobanteResultado,
} from "./types";

/**
 * Proveedor NULL — organizaciones sin integración fiscal
 * (internacional, o países donde la emisión se hace fuera del sistema).
 * Registra la intención y responde "aceptado" sin emitir.
 */
export class NullBillingProvider implements BillingProvider {
  readonly nombre = "none" as const;
  readonly obligatorio = false;

  async emitir(): Promise<ComprobanteResultado> {
    return {
      aceptado: true,
      mensaje:
        "Emisión fiscal no configurada para esta organización. El comprobante quedó registrado internamente.",
    };
  }
}
