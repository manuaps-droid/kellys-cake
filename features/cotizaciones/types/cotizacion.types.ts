export type CotizacionItemTipo =
  | "pastel"
  | "cupcake"
  | "cakepop"
  | "galleta"
  | "coffee"
  | "otro";

export type CotizacionItem = {
  id: string;
  tipo: CotizacionItemTipo;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  imagen: string | null;
  sabores?: string;
  rellenos?: string;
  decoracion?: string;
  observaciones?: string;
};

export type CotizacionEstado = "enviada" | "aceptada" | "rechazada";

export type Cotizacion = {
  id: string;
  numero: number;
  catering_id: string | null;
  nombre: string | null;
  email: string | null;
  celular: string | null;
  tipo_evento: string | null;
  fecha_evento: string | null;
  num_invitados: number | null;
  items: CotizacionItem[];
  subtotal: number;
  total: number;
  estado: CotizacionEstado;
  token: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const COTIZACION_ESTADO_LABELS: Record<CotizacionEstado, string> = {
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export const COTIZACION_ESTADO_STYLES: Record<CotizacionEstado, string> = {
  enviada: "bg-blue-50 text-blue-700 border-blue-200",
  aceptada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rechazada: "bg-red-50 text-red-700 border-red-200",
};
