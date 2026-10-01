export interface RewardsNivel {
  id: string;
  nombre: string;
  slug: string;
  emoji: string;
  puntos_minimos: number;
  descuento_pct: number;
  delivery_gratis_umbral: number | null;
  beneficios: string[];
  orden: number;
}

export interface RewardsPuntos {
  id: string;
  cliente_id: string;
  puntos_totales: number;
  puntos_disponibles: number;
  nivel_id: string | null;
  nivel?: RewardsNivel | null;
  updated_at: string;
}

export interface RewardsTransaccion {
  id: string;
  cliente_id: string;
  tipo: 'ganancia' | 'canje';
  cantidad: number;
  motivo: string;
  referencia_id: string | null;
  referencia_tipo: string | null;
  created_at: string;
}

export interface RewardsResumen {
  puntos: RewardsPuntos;
  nivel_actual: RewardsNivel | null;
  siguiente_nivel: RewardsNivel | null;
  progreso_pct: number; // 0-100 progress to next level
}
