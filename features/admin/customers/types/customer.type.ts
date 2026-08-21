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
}