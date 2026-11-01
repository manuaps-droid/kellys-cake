export type TipoPronostico = "supuesto" | "estadistico";

export type ProductoPresetPrediccion = {
  id: string;
  nombre: string;
  precio_costo?: number;
  precio_venta?: number;
  margen_porcentaje?: number;
};

export type VendingMaquina = {
  id: string;
  nombre: string;
  ubicacion: string;
  tipo_ubicacion: string;
  formato: string;
  capacidad_slots: number;
  activo: boolean;
};

export type SupuestoDemanda = {
  id: string;
  producto_id: string;
  maquina_id?: string;
  unidades_base: number;
  dia_semana?: number;
  activo: boolean;
};

export type DesglosePrediccion = {
  producto_id: string;
  producto_nombre: string;
  maquina_id?: string;
  maquina_nombre?: string;
  fecha: string;
  dias_proyectados: number;
  unidades_base_por_dia: number;
  demanda_total_estimada: number;
  costo_unitario: number;
  costo_variable_total: number;
  precio_venta: number;
  ingresos_estimados: number;
  margen_bruto: number;
  margen_porcentaje: number;
  estado: "saludable" | "alerta" | "critico";
  origen: "supuesto" | "estadistico";
  es_provisional: boolean;
};

export type ResultadoPrediccion = {
  productos: DesglosePrediccion[];
  costo_variable_total: number;
  costo_fijo_total: number;
  costo_total: number;
  ingresos_totales: number;
  utilidad_bruta: number;
  margen_global_porcentaje: number;
  punto_equilibrio_unidades: number;
  punto_equilibrio_soles: number;
  dias_para_equilibrio: number;
  salud: "saludable" | "alerta" | "critico";
  recomendacion: string;
  origen: TipoPronostico;
  es_provisional: boolean;
};

export type CalculoDemandaRequest = {
  producto_ids?: string[];
  maquina_id?: string;
  dias_proyectados?: number;
  margen_objetivo_porcentaje?: number;
};
