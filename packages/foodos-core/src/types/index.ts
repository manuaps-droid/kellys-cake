export interface Ingrediente {
  id: string;
  nombre: string;
  unidadCompra: string;
  unidadUso: string;
  factorConversion: number;
  costoUnitario: number;
  porcentajeMermaEstandar: number;
}

export interface RecetaItem {
  id: string;
  ingredienteId: string;
  cantidad: number;
  unidad: string;
  mermaPorcentaje: number;
}

export interface Receta {
  id: string;
  productoId: string;
  nombre: string;
  rendimiento: number;
  items: RecetaItem[];
}
