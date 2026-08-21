export type AdminProjectStatus =
  | "pendiente"
  | "cotizacion_enviada"
  | "aprobado"
  | "entregado"
  | "anulado"
  | "finalizado";

export interface AdminProjectCustomer {
  id: string;
  nombre: string;
  apellidos: string | null;
  correo: string | null;
  celular: string | null;
}

export interface AdminProjectCatalog {
  id: string;
  nombre: string;
  tipo: string;
}

export interface AdminProjectImage {
  id: string;
  media_id: string;
  orden: number;
  url: string | null;
  nombre: string | null;
}

export interface AdminProject {
  id: string;
  descripcion: string;
  mensaje: string | null;
  personas: number;
  presupuesto: number | null;
  alergias: string | null;
  fecha_evento: string | null;
  hora_evento: string | null;
  tipo_entrega: string;
  direccion: string | null;
  referencia: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: AdminProjectStatus;
  observaciones: string | null;
  autoriza_comunicacion: boolean;
  created_at: string;
  updated_at: string;
  cliente: AdminProjectCustomer;
  catalogos: AdminProjectCatalog[];
  imagenes: AdminProjectImage[];
}
