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
  if (item.precio_unitario != null && item.precio_unitario > 0) {
    return item.precio_unitario;
  }
  if (item.presentacion?.precio != null && item.presentacion.precio > 0) {
    return item.presentacion.precio;
  }
  return item.productos?.precio ?? 0;
}

export function getItemNombre(item: CartItem): string {
  const base = item.nombre ?? item.productos?.nombre ?? "Producto";
  if (item.presentacion?.nombre) {
    const presTrimmed = item.presentacion.nombre.trim();
    const presLabel = /^\d+$/.test(presTrimmed) ? `${presTrimmed} und` : presTrimmed;
    if (!base.toLowerCase().includes(presLabel.toLowerCase())) {
      return `${base} (${presLabel})`;
    }
  }
  return base;
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
