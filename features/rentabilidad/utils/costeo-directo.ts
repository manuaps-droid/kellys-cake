export type CostoDirectoInput = {
  empaque: number;
  otrosDirectos: number;
};

export type MultiplicadorConfig = {
  valor: number;
};

export type ResultadoCosteoDirecto = {
  // Capa 1: Ingredientes (de la receta)
  costoIngredientes: number;
  rendimiento: number;

  // Capa 2: Costos directos por unidad
  costoEmpaque: number;
  costoOtrosDirectos: number;
  subtotalDirectos: number;

  // Capa 3: Overhead (multiplicador × ingredientes)
  multiplicador: number;
  costoOverhead: number;
  costoIngredientesConOverhead: number;

  // Resultado final
  costoRealUnitario: number;
  gananciaReal: number;
  margenRealPct: number;

  // Diagnóstico en lenguaje natural
  diagnostico: string;
  estado: "optimo" | "alerta" | "critico";
};

export function calcularCosteoDirecto(input: {
  costoIngredientes: number;
  rendimiento: number;
  empaque: number;
  otrosDirectos: number;
  multiplicador: number;
  precioVenta: number;
}): ResultadoCosteoDirecto {
  const ing = Math.max(0, input.costoIngredientes || 0);
  const emp = Math.max(0, input.empaque || 0);
  const otros = Math.max(0, input.otrosDirectos || 0);
  const mult = Math.max(1, input.multiplicador || 1);
  const precio = Math.max(0, input.precioVenta || 0);

  const costoIngredientes = ing / Math.max(1, input.rendimiento || 1);
  const costoOverhead = costoIngredientes * (mult - 1);
  const costoIngredientesConOverhead = costoIngredientes * mult;
  const subtotalDirectos = emp + otros;
  const costoRealUnitario = costoIngredientesConOverhead + subtotalDirectos;

  const gananciaReal = precio - costoRealUnitario;
  const margenRealPct = precio > 0 ? (gananciaReal / precio) * 100 : 0;

  let estado: "optimo" | "alerta" | "critico" = "optimo";
  let diagnostico = "";

  if (margenRealPct >= 50) {
    estado = "optimo";
    diagnostico = `✅ Margen saludable de ${margenRealPct.toFixed(1)}%. Este producto te deja S/ ${gananciaReal.toFixed(2)} limpios por unidad.`;
  } else if (margenRealPct >= 30) {
    estado = "alerta";
    diagnostico = `⚠️ Margen de ${margenRealPct.toFixed(1)}%. Te deja S/ ${gananciaReal.toFixed(2)} por unidad. Considera subir el precio o reducir el multiplicador.`;
  } else {
    estado = "critico";
    diagnostico = `🚨 Margen crítico de ${margenRealPct.toFixed(1)}%. Solo te deja S/ ${gananciaReal.toFixed(2)}. A este precio estás casi trabajando gratis.`;
  }

  return {
    costoIngredientes: Math.round(costoIngredientes * 100) / 100,
    rendimiento: input.rendimiento || 1,
    costoEmpaque: emp,
    costoOtrosDirectos: otros,
    subtotalDirectos: Math.round(subtotalDirectos * 100) / 100,
    multiplicador: mult,
    costoOverhead: Math.round(costoOverhead * 100) / 100,
    costoIngredientesConOverhead: Math.round(costoIngredientesConOverhead * 100) / 100,
    costoRealUnitario: Math.round(costoRealUnitario * 100) / 100,
    gananciaReal: Math.round(gananciaReal * 100) / 100,
    margenRealPct: Math.round(margenRealPct * 10) / 10,
    diagnostico,
    estado,
  };
}

export const EMPAQUE_DEFAULT = 7.5;
export const OTROS_DIRECTOS_DEFAULT = 2.0;
export const MULTIPLICADOR_DEFAULT = 1.4;
