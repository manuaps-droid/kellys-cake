export type VendingMaquina = {
  id: string;
  nombre: string;
  ubicacion: string;
  tipo_ubicacion?: string;
  formato: string;
  capacidad_slots: number;
  activo: boolean;
};

export type ItemVentaVending = {
  id: string;
  maquina_id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_venta: string;
};

export type ResumenMaquina = {
  id: string;
  nombre: string;
  ubicacion: string;
  formato: string;
  capacidad_slots: number;
  productos_vendidos: number;
  ingresos_totales: number;
  costo_total: number;
  utilidad_bruta: number;
  margen_porcentaje: number;
  estado: "saludable" | "alerta" | "critico";
};

export type ProductoVending = {
  id: string;
  nombre: string;
  precio_venta: number;
  costo_unitario: number;
  cantidad_actual: number;
};
