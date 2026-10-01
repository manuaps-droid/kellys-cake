export interface AdminCustomer {
  id: string;

  nombre: string;

  apellidos: string | null;

  correo: string | null;

  celular: string | null;

  created_at: string;

  user_id: string;

  rol: string;

  activo: boolean;

  foto: string | null;
  dni?: string | null;

  pedidos?: {
    id: string;
    total: number;
    estado: string;
    created_at: string;
  }[];

  proyectos?: {
    id: string;
    personas: number;
    presupuesto: number | null;
    estado: string;
    created_at: string;
  }[];

  rewards?: {
    puntos_totales: number;
    puntos_disponibles: number;
    nivel: string | null;
  } | null;

  transacciones_puntos?: {
    id: string;
    tipo: "ganancia" | "canje";
    cantidad: number;
    motivo: string;
    referencia_id: string | null;
    referencia_tipo: string | null;
    created_at: string;
  }[];
}