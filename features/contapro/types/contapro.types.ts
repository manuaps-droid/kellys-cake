export type ContaproTipo = "compras" | "ventas";

export type ContaproPeriodo = {
  mes: number;
  anio: number;
};

export type ContaproMovimiento = {
  fecha: string;
  mes: number;
  anio: number;
  documento: string | null;
  tercero: string | null;
  ruc: string | null;
  subtotal: number | null;
  igv: number | null;
  total: number;
  moneda: string;
  detalle: string | null;
  raw: Record<string, unknown>;
};

export type ContaproColumnas = {
  fecha: string | null;
  documento: string | null;
  tercero: string | null;
  ruc: string | null;
  subtotal: string | null;
  igv: string | null;
  total: string | null;
};

export type ContaproAnalisis = {
  ok: boolean;
  mensaje?: string;
  tablaFalta?: boolean;
  columnas: ContaproColumnas;
  filasValidas: number;
  filasFueraPeriodo: number;
  filasSinTotal: number;
  total: number;
  igv: number;
  primerFecha: string | null;
  ultimaFecha: string | null;
  porMes: {
    mes: number;
    anio: number;
    total: number;
    filas: number;
  }[];
};

export type ContaproImportItem = {
  id: string;
  archivo_nombre: string;
  tipo: ContaproTipo;
  periodo_desde: string;
  periodo_hasta: string;
  total: number;
  igv: number;
  filas: number;
  creado_en: string;
};

export type ContaproResumenMes = {
  mes: number;
  anio: number;
  ventas: number;
  compras: number;
  margen: number;
  margenPct: number;
};
