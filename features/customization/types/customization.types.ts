export type DeliveryType =
  | "delivery"
  | "pickup";

export interface InspirationImage {
  id: string;

  preview: string;

  fileName: string;
}

export interface CustomizationData {
  celebration: string;

  description: string;

  people: number;

  flavors: string[];

  fillings: string[];

  frostings: string[];

  message: string;

  allergies: string;

  budget: number | null;

  deliveryDate: string;

  deliveryTime: string;

  deliveryType: DeliveryType;

  address: string;

  reference: string;

  latitude: number | null;

  longitude: number | null;

  observaciones: string;

  autorizaComunicacion: boolean;

  /**
   * Imágenes seleccionadas durante el asistente.
   * Temporalmente se mantienen como File[] hasta completar
   * la migración al módulo features/media.
   */
  inspirationImages: File[];
}