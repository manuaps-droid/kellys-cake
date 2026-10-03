// Catálogos cuyos productos se venden por unidad mínima (mínimo 6)
// Se identifican por nombre de catálogo (catalogo_personalizacion.nombre)
// o por la categoría del producto (productos.categoria) o su nombre.
export const CATALOGOS_VENTA_MINIMA = ["macarrones", "alfajores", "donas"];

export const MIN_CANTIDAD = 6;

export function normalizarNombre(nombre?: string | null): string {
  return (nombre ?? "").toLowerCase().trim();
}

export function catalogoRequiereMinimo(nombre?: string | null): boolean {
  const value = normalizarNombre(nombre);
  return CATALOGOS_VENTA_MINIMA.some((item) => value.includes(item));
}

export function esProductoVentaMinima(info: {
  nombre?: string | null;
  categoria?: string | null;
  catalogo?: string | null;
}): boolean {
  const full = `${info.nombre ?? ""} ${info.categoria ?? ""} ${info.catalogo ?? ""}`.toLowerCase();
  return (
    full.includes("alfajor") ||
    full.includes("macarr") ||
    full.includes("dona")
  );
}

// Retorna la cantidad mínima requerida para un producto dado
// su catálogo o categoría. Devuelve 1 cuando no aplica mínimo.
export function minCantidadPara(nombreCatalogo?: string | null): number {
  return catalogoRequiereMinimo(nombreCatalogo) ? MIN_CANTIDAD : 1;
}
