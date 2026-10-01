export interface Referido {
  id: string;
  referente_id: string;
  referido_id: string | null;
  codigo: string;
  estado: 'pendiente' | 'registrado' | 'completado' | 'expirado';
  recompensa_referente: number;
  recompensa_referido: number;
  created_at: string;
  completado_at: string | null;
  // Joined data
  referido?: {
    nombre: string;
    apellidos: string | null;
  } | null;
}

export interface ReferidoStats {
  codigo: string;
  total_referidos: number;
  completados: number;
  pendientes: number;
  puntos_ganados: number;
}
