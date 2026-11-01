/**
 * Formateo de moneda por organización — adapter de localización.
 * Hoy todas las orgs usan PEN; al vender a otros países solo se
 * cambia `org.moneda` y toda la UI se formatea sola.
 */

export type CurrencyCode = "PEN" | "USD" | "EUR" | "MXN" | "COP" | "CLP";

const LOCALES_POR_MONEDA: Record<CurrencyCode, string> = {
  PEN: "es-PE",
  USD: "en-US",
  EUR: "es-ES",
  MXN: "es-MX",
  COP: "es-CO",
  CLP: "es-CL",
};

/**
 * Formatea un monto en la moneda de la organización.
 * Ej: formatMoney(45.5, "PEN") → "S/ 45.50"
 */
export function formatMoney(
  monto: number,
  moneda: CurrencyCode = "PEN",
  decimales = 2
): string {
  return new Intl.NumberFormat(LOCALES_POR_MONEDA[moneda] ?? "es-PE", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(monto || 0);
}

/**
 * Solo el símbolo de la moneda ("S/", "US$", "€"...).
 * Para usos inline tipo `S/ {valor}` → `{simboloMoneda()} {valor}`.
 */
export function simboloMoneda(moneda: CurrencyCode = "PEN"): string {
  const partes = formatMoney(0, moneda);
  return partes.replace(/[\d.,\s]/g, "").trim() || "S/";
}

/**
 * Formato compacto sin símbolo, para tablas y rankings.
 * Ej: formatoNumero(1234.56) → "1,234.56"
 */
export function formatoNumero(
  valor: number,
  decimales = 2,
  locale = "es-PE"
): string {
  return (valor || 0).toLocaleString(locale, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
