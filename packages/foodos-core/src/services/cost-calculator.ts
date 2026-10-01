import { Ingrediente, Receta, RecetaItem } from '../types';

export class CostCalculator {
  static calcularCostoIngredienteUso(ingrediente: Ingrediente): number {
    if (ingrediente.factorConversion <= 0) return 0;
    return ingrediente.costoUnitario / ingrediente.factorConversion;
  }

  static calcularCostoLinea(item: RecetaItem, ingrediente: Ingrediente): number {
    const costoUso = this.calcularCostoIngredienteUso(ingrediente);
    const mermaTotal = (ingrediente.porcentajeMermaEstandar + item.mermaPorcentaje) / 100;
    const cantidadConMerma = item.cantidad / (1 - (mermaTotal > 0.99 ? 0.99 : mermaTotal));
    
    return cantidadConMerma * costoUso;
  }

  static calcularCostoReceta(receta: Receta, ingredientesMap: Map<string, Ingrediente>): { costoTotal: number, costoUnitario: number } {
    let costoTotal = 0;

    for (const item of receta.items) {
      const ingrediente = ingredientesMap.get(item.ingredienteId);
      if (ingrediente) {
        costoTotal += this.calcularCostoLinea(item, ingrediente);
      }
    }

    const costoUnitario = receta.rendimiento > 0 ? costoTotal / receta.rendimiento : 0;

    return {
      costoTotal,
      costoUnitario
    };
  }
}
