export type DeliveryMethod = "delivery" | "pickup";

export type PaymentMethod =
  | "yape"
  | "plin"
  | "transfer"
  | "cash"
  | "culqi"
  | "mercadopago";

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recipientName: string;
}

export interface AddressData {
  department: string;
  province: string;
  district: string;
  address: string;
  reference: string;
  lat: number | null;
  lng: number | null;
  deliveryDistance: number | null;
  deliveryFee: number | null;
}

export interface InvoiceData {
  ruc: string;
  razonSocial: string;
  direccionFiscal: string;
}

export type PaymentType = "total" | "abono" | "";

export interface CheckoutData {
  customer: CustomerData;
  deliveryMethod: DeliveryMethod;
  deliveryDate?: string;
  deliveryTime?: string;
  address: AddressData;
  paymentMethod: PaymentMethod | "";
  paymentType: PaymentType;
  needsInvoice: boolean;
  invoice: InvoiceData;
}

export interface PaymentResult {
  success: boolean;
  chargeId?: string;
  paymentId?: string;
  reference?: string;
  message?: string;
}