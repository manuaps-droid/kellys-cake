export interface CartProduct {
  id: string;

  nombre: string;

  descripcion: string | null;

  precio: number;

  imagen: string | null;
}

export interface CartItem {
  id: string;

  producto_id: string | null;

  cantidad: number;

  productos: CartProduct | null;

  // Items de cotización (precio fijado)
  precio_unitario: number | null;

  nombre: string | null;

  descripcion: string | null;

  imagen: string | null;

  cotizacion_id: string | null;

  // Presentación elegida (coffee break / venta mínima)
  presentacion_id: string | null;

  presentacion: {
    nombre: string;
    precio: number;
  } | null;
}

export function getItemUnitPrice(item: CartItem): number {
  return item.precio_unitario ?? item.productos?.precio ?? 0;
}

export function getItemNombre(item: CartItem): string {
  return item.nombre ?? item.productos?.nombre ?? "Producto";
}

export function getItemImagen(item: CartItem): string | null {
  return item.imagen ?? item.productos?.imagen ?? null;
}

export interface CartContextType {
  items: CartItem[];

  loading: boolean;

  drawerOpen: boolean;

  totalItems: number;

  subtotal: number;

  openDrawer(): void;

  closeDrawer(): void;

  refreshCart(): Promise<void>;
}
