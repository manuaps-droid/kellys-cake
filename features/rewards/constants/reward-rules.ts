// Points awarded per action
export const REWARD_RULES = {
  REGISTRO: 20,
  PRIMERA_COMPRA: 50,
  POR_CADA_10_SOLES: 5,
  RESENA_CON_FOTO: 15,
  REFERIDO_COMPLETADO: 30,
  CUMPLEANOS: 25,
  COMPARTIR_REDES: 10,
  PERFIL_COMPLETO: 10,
} as const;

// Calculate points for a purchase with customizable rates
export function calcularPuntosPorCompra(
  total: number,
  solesBase: number = 10,
  puntosBase: number = 5
): number {
  if (solesBase <= 0 || puntosBase <= 0) return 0;
  return Math.floor(total / solesBase) * puntosBase;
}

// Point redemption rate: 100 points = S/ 5
export const PUNTOS_POR_SOL = 20; // 20 points = S/ 1
export function calcularValorPuntos(puntos: number): number {
  return puntos / PUNTOS_POR_SOL;
}
