export interface Resena {
  id: string;
  cliente_id: string;
  producto_id: string;
  pedido_id: string | null;
  calificacion: number;
  comentario: string | null;
  foto_url: string | null;
  aprobada: boolean;
  puntos_otorgados: number;
  created_at: string;
  // Joined data
  cliente?: {
    nombre: string;
    apellidos: string | null;
    foto: string | null;
  } | null;
}

export interface ResenaStats {
  promedio: number;
  total: number;
  distribucion: Record<number, number>; // { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
}

export interface CreateResenaInput {
  producto_id: string;
  pedido_id?: string;
  calificacion: number;
  comentario?: string;
  foto_url?: string;
}
