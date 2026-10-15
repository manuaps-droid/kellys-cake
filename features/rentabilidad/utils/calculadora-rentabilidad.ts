import {
  CostosFijos,
  CostosVariablesUnitarios,
  CategoriaMargenSugerido,
  CalculoRentabilidadResult,
  DiagnosticoMetrica,
} from "../types/rentabilidad.types";

export const CATEGORIAS_MARGEN_SUGERIDO: CategoriaMargenSugerido[] = [
  {
    id: "tortas-autor",
    nombre: "Tortas de Autor & Diseño",
    margenSugerido: 75,
    rangoMin: 70,
    rangoMax: 80,
    descripcion: "Bodas, 15 años y eventos exclusivos con alto valor artístico y personalización.",
    badge: "Alta Gama",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "tortas-saludables",
    nombre: "Línea Saludable & Vegana",
    margenSugerido: 70,
    rangoMin: 65,
    rangoMax: 75,
    descripcion: "Sin azúcar refinada, sin gluten, keto o veganas con insumos selectos.",
    badge: "Especializada",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "tortas-pet",
    nombre: "Línea Pet Friendly (Dog Cakes)",
    margenSugerido: 70,
    rangoMin: 70,
    rangoMax: 75,
    descripcion: "Cumpleaños perrunos, muffins e ingredientes aptos para mascotas.",
    badge: "Nicho Premium",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "pasteleria-tradicional",
    nombre: "Pastelería Tradicional & Porciones",
    margenSugerido: 60,
    rangoMin: 55,
    rangoMax: 65,
    descripcion: "Tres leches, carrot cake, cheesecakes clásicos y porciones vitrina.",
    badge: "Rotación Continua",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "catering-bocaditos",
    nombre: "Catering & Bocaditos para Eventos",
    margenSugerido: 55,
    rangoMin: 50,
    rangoMax: 60,
    descripcion: "Packs de 50 o 100 unidades de bocaditos dulces y salados al por mayor.",
    badge: "Volumen",
    color: "from-purple-500 to-violet-600",
  },
];

export const COSTOS_FIJOS_DEFAULT: CostosFijos = {
  alquiler: 1200,
  servicios: 450, // Luz trifásica, agua y gas
  sueldosAdministrativos: 1800, // Sueldos fijos / gestión
  softwareInternet: 180, // Hosting, internet, app FoodOS
  marketingPublicidad: 500, // Pauta Meta Ads + contenido
  otrosFijos: 270, // Contador, mantenimiento hornos, depreciación
};

export const COSTOS_VARIABLES_DEFAULT: CostosVariablesUnitarios = {
  materiaPrima: 28.50, // Insumos directos de receta
  empaque: 7.50, // Caja alta con visor, base rígida y lazo
  manoObraDirecta: 14.00, // Horas decorador / pastelero directo por unidad
  otrosVariables: 4.00, // Comisiones pasarela, gas unitario, insumos descartables
};

export function calcularRentabilidad(
  variables: CostosVariablesUnitarios,
  fijos: CostosFijos,
  margenPorcentaje: number,
  esMargenPersonalizado: boolean,
  unidadesMensuales: number = 45,
  patrimonioInvertido: number = 20000
): CalculoRentabilidadResult {
  // Asegurar números válidos
  const mp = Math.max(0, Number(variables.materiaPrima) || 0);
  const emp = Math.max(0, Number(variables.empaque) || 0);
  const mod = Math.max(0, Number(variables.manoObraDirecta) || 0);
  const otrosVar = Math.max(0, Number(variables.otrosVariables) || 0);

  const costoVariableTotal = mp + emp + mod + otrosVar;

  // Clampear margen entre 1% y 95% para evitar división por cero
  const margenSeguro = Math.min(95, Math.max(1, Number(margenPorcentaje) || 50));

  // Fórmula de Precio con Margen Comercial: Precio = Costo Variable / (1 - Margen)
  const factorMargen = 1 - margenSeguro / 100;
  const precioVentaSugerido = factorMargen > 0 ? costoVariableTotal / factorMargen : 0;
  const gananciaBrutaUnitaria = precioVentaSugerido - costoVariableTotal;

  // Costos fijos totales
  const costosFijosTotales =
    (Number(fijos.alquiler) || 0) +
    (Number(fijos.servicios) || 0) +
    (Number(fijos.sueldosAdministrativos) || 0) +
    (Number(fijos.softwareInternet) || 0) +
    (Number(fijos.marketingPublicidad) || 0) +
    (Number(fijos.otrosFijos) || 0);

  // Techos de Costo Gastronómico sobre el Precio de Venta
  const foodCostPorcentaje = precioVentaSugerido > 0 ? (mp / precioVentaSugerido) * 100 : 0;
  const laborCostPorcentaje = precioVentaSugerido > 0 ? (mod / precioVentaSugerido) * 100 : 0;
  const primeCostPorcentaje = foodCostPorcentaje + laborCostPorcentaje;

  // Diagnóstico Food Cost (Máximo 30%)
  const diagnosticoFoodCost: DiagnosticoMetrica =
    foodCostPorcentaje <= 30
      ? {
          estado: "optimo",
          mensaje: "Excelente control de insumos (≤ 30% del precio de venta).",
          valorActual: foodCostPorcentaje,
          valorObjetivo: "≤ 30%",
        }
      : foodCostPorcentaje <= 35
      ? {
          estado: "alerta",
          mensaje: "Atención: En el límite superior. Ajusta porciones o negocia insumos.",
          valorActual: foodCostPorcentaje,
          valorObjetivo: "≤ 30%",
        }
      : {
          estado: "critico",
          mensaje: "Peligro: Materia prima excesiva (> 35%). Come tu margen de ganancia.",
          valorActual: foodCostPorcentaje,
          valorObjetivo: "≤ 30%",
        };

  // Diagnóstico Labor Cost Directo (Máximo 25%)
  const diagnosticoLaborCost: DiagnosticoMetrica =
    laborCostPorcentaje <= 25
      ? {
          estado: "optimo",
          mensaje: "Mano de obra directa optimizada (≤ 25% del precio de venta).",
          valorActual: laborCostPorcentaje,
          valorObjetivo: "≤ 25%",
        }
      : laborCostPorcentaje <= 30
      ? {
          estado: "alerta",
          mensaje: "Costo de personal elevado. Estandariza tiempos de decoración.",
          valorActual: laborCostPorcentaje,
          valorObjetivo: "≤ 25%",
        }
      : {
          estado: "critico",
          mensaje: "Peligro: Personal directo supera el 30%. Estandariza la producción.",
          valorActual: laborCostPorcentaje,
          valorObjetivo: "≤ 25%",
        };

  // Diagnóstico Prime Cost (Materia Prima + Personal Directo <= 55%)
  const diagnosticoPrimeCost: DiagnosticoMetrica =
    primeCostPorcentaje <= 55
      ? {
          estado: "optimo",
          mensaje: "Prime Cost perfecto (≤ 55%). Tu negocio tiene alta salud operativa.",
          valorActual: primeCostPorcentaje,
          valorObjetivo: "≤ 55%",
        }
      : primeCostPorcentaje <= 62
      ? {
          estado: "alerta",
          mensaje: "Prime Cost moderado. Poco colchón para absorber costos fijos.",
          valorActual: primeCostPorcentaje,
          valorObjetivo: "≤ 55%",
        }
      : {
          estado: "critico",
          mensaje: "Crítico: La suma de insumos y personal supera el 62%.",
          valorActual: primeCostPorcentaje,
          valorObjetivo: "≤ 55%",
        };

  // Punto de Equilibrio
  const margenContribucionUnitario = precioVentaSugerido - costoVariableTotal;
  const ratioMargenContribucion =
    precioVentaSugerido > 0 ? margenContribucionUnitario / precioVentaSugerido : 0;

  const puntoEquilibrioSoles =
    ratioMargenContribucion > 0 ? costosFijosTotales / ratioMargenContribucion : 0;

  const puntoEquilibrioUnidades =
    margenContribucionUnitario > 0
      ? Math.ceil(costosFijosTotales / margenContribucionUnitario)
      : 0;

  const unidadesDiariasPuntoEquilibrio =
    puntoEquilibrioUnidades > 0 ? +(puntoEquilibrioUnidades / 26).toFixed(1) : 0;

  // Proyecciones Mensuales según volumen de pedidos simulado
  const unidadesSimuladas = Math.max(1, Number(unidadesMensuales) || 45);
  const ventasTotalesProyectadas = unidadesSimuladas * precioVentaSugerido;
  const costosVariablesTotales = unidadesSimuladas * costoVariableTotal;
  const utilidadBrutaMensual = ventasTotalesProyectadas - costosVariablesTotales;
  const utilidadNetaMensual = utilidadBrutaMensual - costosFijosTotales;

  // Ratios Financieros
  const ros = ventasTotalesProyectadas > 0 ? (utilidadNetaMensual / ventasTotalesProyectadas) * 100 : 0;

  const capitalBase = Math.max(1000, Number(patrimonioInvertido) || 20000);
  const roeAnualizado = (utilidadNetaMensual * 12 / capitalBase) * 100;

  const costosTotalesAnuales = (costosVariablesTotales + costosFijosTotales) * 12;
  const roi = costosTotalesAnuales > 0 ? ((utilidadNetaMensual * 12) / costosTotalesAnuales) * 100 : 0;

  // Diagnóstico ROS (Return on Sales)
  const diagnosticoROS: DiagnosticoMetrica =
    ros >= 20
      ? {
          estado: "optimo",
          mensaje: "Excelente rentabilidad neta sobre ventas (≥ 20%). Modelo de alta rentabilidad.",
          valorActual: ros,
          valorObjetivo: "≥ 20%",
        }
      : ros >= 12
      ? {
          estado: "alerta",
          mensaje: "Rentabilidad neta aceptable (12% - 20%). Hay espacio para optimizar costos fijos.",
          valorActual: ros,
          valorObjetivo: "≥ 20%",
        }
      : {
          estado: "critico",
          mensaje: ros < 0 ? "Pérdida operativa: Las ventas no cubren los costos fijos." : "Margen neto peligroso (< 12%).",
          valorActual: ros,
          valorObjetivo: "≥ 20%",
        };

  // Diagnóstico ROE (Return on Equity)
  const diagnosticoROE: DiagnosticoMetrica =
    roeAnualizado >= 30
      ? {
          estado: "optimo",
          mensaje: "Retorno sobresaliente sobre capital (≥ 30% anual). Multiplica el dinero invertido.",
          valorActual: roeAnualizado,
          valorObjetivo: "≥ 30%",
        }
      : roeAnualizado >= 15
      ? {
          estado: "alerta",
          mensaje: "Retorno sobre patrimonio moderado (15% - 30%). Superior a fondos bancarios.",
          valorActual: roeAnualizado,
          valorObjetivo: "≥ 30%",
        }
      : {
          estado: "critico",
          mensaje: roeAnualizado < 0 ? "Destrucción de capital (pérdidas)." : "Retorno bajo (< 15%).",
          valorActual: roeAnualizado,
          valorObjetivo: "≥ 30%",
        };

  // Diagnóstico ROI (Return on Investment)
  const diagnosticoROI: DiagnosticoMetrica =
    roi >= 25
      ? {
          estado: "optimo",
          mensaje: "Retorno sobre inversión excelente (≥ 25% anual sobre egresos totales).",
          valorActual: roi,
          valorObjetivo: "≥ 25%",
        }
      : roi >= 15
      ? {
          estado: "alerta",
          mensaje: "Retorno de inversión saludable (15% - 25%). Negocio sostenible.",
          valorActual: roi,
          valorObjetivo: "≥ 25%",
        }
      : {
          estado: "critico",
          mensaje: "Retorno de inversión insuficiente (< 15%). Aumenta volumen o precio.",
          valorActual: roi,
          valorObjetivo: "≥ 25%",
        };

  // Indicadores Comerciales
  const ticketPromedio = precioVentaSugerido;
  const cacMaximoRecomendado = ticketPromedio * 0.15; // Máximo 15% del ticket de venta en pauta
  const ltvObjetivo = ticketPromedio * 3.2; // Estimado a 3.2 compras al año

  return {
    costoVariableTotal,
    margenPorcentajeAplicado: margenSeguro,
    esMargenPersonalizado,
    precioVentaSugerido,
    gananciaBrutaUnitaria,
    costosFijosTotales,
    foodCostPorcentaje,
    laborCostPorcentaje,
    primeCostPorcentaje,
    diagnosticoFoodCost,
    diagnosticoLaborCost,
    diagnosticoPrimeCost,
    margenContribucionUnitario,
    ratioMargenContribucion,
    puntoEquilibrioSoles,
    puntoEquilibrioUnidades,
    unidadesDiariasPuntoEquilibrio,
    unidadesMensualesEstimadas: unidadesSimuladas,
    ventasTotalesProyectadas,
    costosVariablesTotales,
    utilidadBrutaMensual,
    utilidadNetaMensual,
    ros,
    roe: roeAnualizado,
    roi,
    patrimonioInvertido: capitalBase,
    diagnosticoROS,
    diagnosticoROE,
    diagnosticoROI,
    ticketPromedio,
    cacMaximoRecomendado,
    ltvObjetivo,
  };
}
