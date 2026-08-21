export type ProductPresentation = {
  id: string;
  producto_id: string;

  nombre: string;
  descripcion: string | null;

  precio: number;
  precio_oferta: number | null;

  sku: string | null;
  codigo_barras: string | null;

  stock: number | null;

  peso: number | null;
  tiempo_preparacion: number | null;

  imagen_id: string | null;

  slug: string | null;

  orden: number;
  predeterminada: boolean;
  activo: boolean;

  created_at: string;
  updated_at: string;
};

export type CreateProductPresentationInput = {
  producto_id: string;

  nombre: string;
  descripcion?: string;

  precio: number;
  precio_oferta?: number | null;

  sku?: string;
  codigo_barras?: string;

  stock?: number | null;

  peso?: number | null;
  tiempo_preparacion?: number | null;

  imagen_id?: string | null;

  slug?: string;

  orden?: number;
  predeterminada?: boolean;
};

export type UpdateProductPresentationInput = {
  id: string;

  nombre: string;
  descripcion?: string;

  precio: number;
  precio_oferta?: number | null;

  sku?: string;
  codigo_barras?: string;

  stock?: number | null;

  peso?: number | null;
  tiempo_preparacion?: number | null;

  imagen_id?: string | null;

  slug?: string;

  predeterminada?: boolean;
  activo: boolean;
};