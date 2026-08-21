export interface AdminCatalog {
  id: string;

  tipo: string;

  nombre: string;

  descripcion: string | null;

  orden: number;

  activo: boolean;

  precio: number | null;

  created_at?: string;

  updated_at?: string;
}