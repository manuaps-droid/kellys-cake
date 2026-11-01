import type {
  BillingProvider,
  ComprobanteInput,
  ComprobanteResultado,
} from "./types";

/**
 * Proveedor SUNAT (Perú).
 * Hoy la emisión electrónica de Kelly's Cake se gestiona fuera de
 * FoodOS (Contapro / portal SUNAT). Este adapter encapsula ese flujo:
 * al conectar la API de emisión electrónica solo se completa `emitir()`.
 */
export class SunatBillingProvider implements BillingProvider {
  readonly nombre = "sunat" as const;
  readonly obligatorio = true;

  async emitir(input: ComprobanteInput): Promise<ComprobanteResultado> {
    // TODO: conectar con API de emisión electrónica SUNAT.
    // Mientras tanto: valida datos y responde pendiente de envío manual.
    if (!input.items.length || input.total <= 0) {
      return {
        aceptado: false,
        mensaje: "El comprobante no tiene items o el total es inválido.",
      };
    }

    return {
      aceptado: true,
      mensaje: `Comprobante ${input.serie ?? "F"}-${input.numero ?? "0000"} registrado para envío a SUNAT (flujo manual vía Contapro).`,
    };
  }
}
