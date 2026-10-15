export type CostosFijos = {
  alquiler: number;
  servicios: number; // Luz comercial, agua, gas
  sueldosAdministrativos: number; // Sueldos fijos / gestión
  softwareInternet: number; // Hosting, dominio, sistemas, internet, telefonía
  marketingPublicidad: number; // Meta Ads, Google Ads, diseño
  otrosFijos: number; // Contador, mantenimiento, imprevistos
};

export type CostosVariablesUnitarios = {
  materiaPrima: number; // Insumos / ingredientes de la receta
  empaque: number; // Caja con visor, blonda, cintas, sticker, bolsa
  manoObraDirecta: number; // Horas dedicadas de pastelería/decorado por unidad
  otrosVariables: number; // Comisiones pasarela, insumos descartables
};

export type CategoriaMargenSugerido = {
  id: string;
  nombre: string;
  margenSugerido: number; // porcentaje (ej: 75)
  rangoMin: number;
  rangoMax: number;
  descripcion: string;
  badge: string;
  color: string;
};

export type EstadoDiagnostico = 'optimo' | 'alerta' | 'critico';

export type DiagnosticoMetrica = {
  estado: EstadoDiagnostico;
  mensaje: string;
  valorActual: number;
  valorObjetivo: string;
};

export type CalculoRentabilidadResult = {
  // Precios y ganancias
  costoVariableTotal: number;
  margenPorcentajeAplicado: number;
  esMargenPersonalizado: boolean;
  precioVentaSugerido: number;
  gananciaBrutaUnitaria: number;
  
  // Costos Fijos
  costosFijosTotales: number;

  // Techos de Costo Gastronómico
  foodCostPorcentaje: number; // Insumos / Precio Venta * 100 (Max 30%)
  laborCostPorcentaje: number; // Mano de obra / Precio Venta * 100 (Max 25%)
  primeCostPorcentaje: number; // Food Cost + Labor Cost (Max 55%)

  // Diagnósticos de techos
  diagnosticoFoodCost: DiagnosticoMetrica;
  diagnosticoLaborCost: DiagnosticoMetrica;
  diagnosticoPrimeCost: DiagnosticoMetrica;

  // Punto de Equilibrio
  margenContribucionUnitario: number; // Precio - Costo Variable
  ratioMargenContribucion: number; // Margen Contribución / Precio
  puntoEquilibrioSoles: number; // Costos Fijos / Ratio Margen Contribución
  puntoEquilibrioUnidades: number; // Costos Fijos / Margen Contribución Unitario
  unidadesDiariasPuntoEquilibrio: number; // Base 26 días laborables al mes

  // Proyecciones mensuales según volumen estimado
  unidadesMensualesEstimadas: number;
  ventasTotalesProyectadas: number;
  costosVariablesTotales: number;
  utilidadBrutaMensual: number;
  utilidadNetaMensual: number;

  // Ratios Financieros
  ros: number; // Return on Sales (Utilidad Neta / Ventas * 100)
  roe: number; // Return on Equity anualizado (Utilidad Neta * 12 / Patrimonio * 100)
  roi: number; // Return on Investment anual (Utilidad Neta * 12 / Inversión Total Anual * 100)
  patrimonioInvertido: number;

  // Diagnósticos de Ratios
  diagnosticoROS: DiagnosticoMetrica;
  diagnosticoROE: DiagnosticoMetrica;
  diagnosticoROI: DiagnosticoMetrica;

  // Indicadores Comerciales
  ticketPromedio: number;
  cacMaximoRecomendado: number; // Max 15% del ticket promedio
  ltvObjetivo: number; // Valor estimado a 12 meses (ej. 3.5 pedidos al año)
};

export type ProductoPreset = {
  id: string;
  nombre: string;
  categoria?: string;
  precio_costo?: number;
  precio_venta?: number;
  margen_porcentaje?: number;
};
