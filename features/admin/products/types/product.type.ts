export type EstadoProducto =
  | "borrador"
  | "publicado";

export type Product = {
  id: string;

  nombre: string;

  slug: string;

  descripcion: string | null;

  descripcion_corta: string | null;

  precio: number | null;

  categoria: string | null;

  catalogo_id: string | null;

  // Campo antiguo (lo mantenemos temporalmente para compatibilidad)
  imagen: string | null;

  // Nuevo sistema de imágenes
  imagen_principal_id: string | null;

  disponible: boolean;

  destacado: boolean;

  mas_vendido: boolean;

  estado: EstadoProducto;

  seo_title: string | null;

  seo_description: string | null;

  created_at: string;
};