/**
 * Contrato de emisión fiscal (Patrón Estrategia).
 * Cada país implementa su proveedor; el resto de FoodOS solo
 * conoce esta interfaz. Agregar Colombia/México = nuevo archivo,
 * cero cambios en el resto del sistema.
 */

export type ComprobanteInput = {
  orgId: string;
  serie?: string;
  numero?: string;
  clienteNombre: string;
  clienteDoc?: string;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  total: number;
};

export type ComprobanteResultado = {
  aceptado: boolean;
  mensaje: string;
  cdrUrl?: string;
};

export interface BillingProvider {
  /** Nombre del proveedor (sunat | dian | sat | none) */
  readonly nombre: string;
  /** ¿El país exige emisión electrónica? */
  readonly obligatorio: boolean;
  /** Emite un comprobante; retorna resultado sin lanzar si es rechazado */
  emitir(input: ComprobanteInput): Promise<ComprobanteResultado>;
}

export const PROVEEDORES_FISCALES = [
  "sunat",
  "dian",
  "sat",
  "none",
] as const;

export type ProveedorFiscal = (typeof PROVEEDORES_FISCALES)[number];
