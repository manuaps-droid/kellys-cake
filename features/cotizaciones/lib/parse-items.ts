import { parseDescripcion } from "@/features/catering/lib/descripcion-sections";

import type {
  CotizacionItem,
  CotizacionItemTipo,
} from "../types/cotizacion.types";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Parsea la descripción compuesta de una solicitud de catering a items editables.
export function descripcionToItems(descripcion: string): CotizacionItem[] {
  const items: CotizacionItem[] = [];
  const secciones = parseDescripcion(descripcion);

  for (const sec of secciones) {
    if (sec.titulo === "🍰 Pastel personalizado adjuntado") {
      items.push(parsePastelResumen(sec.contenido));
      continue;
    }

    if (sec.titulo === "🧁 Extras personalizados") {
      for (const linea of sec.contenido.split("\n")) {
        const item = parseExtraLinea(linea);
        if (item) items.push(item);
      }
      continue;
    }

    if (sec.titulo === "🥐 Coffee break") {
      for (const linea of sec.contenido.split("\n")) {
        const item = parseCoffeeLinea(linea);
        if (item) items.push(item);
      }
      continue;
    }

    // Descripción base u otra sección suelta
    if (sec.contenido.trim()) {
      items.push({
        id: uid(),
        tipo: "otro",
        nombre: "Detalle del evento",
        descripcion: sec.contenido,
        cantidad: 1,
        precio_unitario: 0,
        imagen: null,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: uid(),
      tipo: "otro",
      nombre: "Servicio de catering",
      descripcion: descripcion,
      cantidad: 1,
      precio_unitario: 0,
      imagen: null,
    });
  }

  return items;
}

// "🧁 Cupcakes personalizados: 12 unidades" => item cupcake
function parseExtraLinea(linea: string): CotizacionItem | null {
  const texto = linea.trim();
  if (!texto) return null;

  const tipo: CotizacionItemTipo =
    texto.toLowerCase().includes("cupcake")
      ? "cupcake"
      : texto.toLowerCase().includes("cake pop")
      ? "cakepop"
      : texto.toLowerCase().includes("galleta")
      ? "galleta"
      : "otro";

  const nombre = texto.replace(/^[^\p{L}\p{N}]*/u, "").split(":")[0].trim();
  const valor = texto.split(":").slice(1).join(":").trim();

  const cantidadMatch = valor.match(/(\d+)/);

  return {
    id: uid(),
    tipo,
    nombre: nombre || "Extra personalizado",
    descripcion: valor,
    cantidad: cantidadMatch ? parseInt(cantidadMatch[1], 10) : 1,
    precio_unitario: 0,
    imagen: null,
  };
}

// "  • Sándwich de pollo — 2 x S/ 8.00 = S/ 16.00"
function parseCoffeeLinea(linea: string): CotizacionItem | null {
  const texto = linea.trim();
  if (!texto || texto.toLowerCase().startsWith("subtotal")) return null;

  const match = texto.match(/•\s*(.+?)\s*—\s*(\d+)\s*x\s*S\/\s*([\d.,]+)/i);

  if (match) {
    return {
      id: uid(),
      tipo: "coffee",
      nombre: match[1].trim(),
      descripcion: texto,
      cantidad: parseInt(match[2], 10),
      precio_unitario: parseFloat(match[3].replace(",", ".")) || 0,
      imagen: null,
    };
  }

  return {
    id: uid(),
    tipo: "coffee",
    nombre: texto.replace(/^•\s*/, ""),
    descripcion: texto,
    cantidad: 1,
    precio_unitario: 0,
    imagen: null,
  };
}

// Extrae sabores, rellenos, decoración y observaciones del resumen del pastel.
function parsePastelResumen(resumen: string): CotizacionItem {
  const lineas = resumen
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const get = (clave: string): string => {
    const linea = lineas.find((l) => l.startsWith(clave));
    return linea ? linea.slice(clave.length).trim() : "";
  };

  const sabores = get("Sabores:");
  const rellenos = get("Rellenos:");
  const coberturas = get("Coberturas:");
  const descripcion = get("Descripción:");
  const alergias = get("Alergias:");
  const decoracion = coberturas || descripcion;
  const observaciones = alergias;

  const partes = [
    sabores && `Sabores: ${sabores}`,
    rellenos && `Rellenos: ${rellenos}`,
    decoracion && `Decoración: ${decoracion}`,
    observaciones && `Observaciones: ${observaciones}`,
  ].filter(Boolean) as string[];

  return {
    id: uid(),
    tipo: "pastel",
    nombre: "Pastel personalizado",
    descripcion: partes.join("\n") || resumen,
    cantidad: 1,
    precio_unitario: 0,
    imagen: null,
    sabores,
    rellenos,
    decoracion,
    observaciones,
  };
}

export function calcularSubtotal(items: CotizacionItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0
  );
}
