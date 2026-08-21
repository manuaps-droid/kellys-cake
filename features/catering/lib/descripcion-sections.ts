// Utilitarios para descomponer la descripción compuesta de una cotización de catering
// en secciones legibles (descripción base + extras + coffee break + pastel).

export type DescripcionSection = {
  titulo: string | null;
  contenido: string;
};

export type ProductosSolicitados = {
  pastel: boolean;
  extras: boolean;
  coffeeBreak: boolean;
};

// Detecta qué productos se solicitaron dentro de la descripción
export function detectarProductos(descripcion: string | null): ProductosSolicitados {
  const d = descripcion ?? "";
  return {
    pastel: d.includes("Pastel personalizado adjuntado"),
    extras: d.includes("🧁 Extras personalizados"),
    coffeeBreak: d.includes("🥐 Coffee break"),
  };
}

// Separa la descripción compuesta en secciones
export function parseDescripcion(descripcion: string): DescripcionSection[] {
  const markers: { titulo: string; prefix: string }[] = [
    { titulo: "🧁 Extras personalizados", prefix: "🧁 Extras personalizados:" },
    { titulo: "🥐 Coffee break", prefix: "🥐 Coffee break:" },
    { titulo: "🍰 Pastel personalizado adjuntado", prefix: "🍰 Pastel personalizado adjuntado:" },
  ];

  const sections: DescripcionSection[] = [];
  const regex = /\n{2,}/;
  const parts = descripcion.split(regex);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    let matched = false;
    for (const m of markers) {
      if (trimmed.startsWith(m.prefix)) {
        sections.push({
          titulo: m.titulo,
          contenido: trimmed.slice(m.prefix.length).trim(),
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections.push({ titulo: null, contenido: trimmed });
    }
  }
  return sections;
}

// Colores por sección para reutilizar entre vistas
export function estiloSeccion(titulo: string | null): string {
  if (titulo === "🧁 Extras personalizados") return "bg-pink-50 text-pink-900";
  if (titulo === "🥐 Coffee break") return "bg-amber-50 text-amber-900";
  if (titulo === "🍰 Pastel personalizado adjuntado") return "bg-emerald-50 text-emerald-900";
  return "bg-gray-50 text-gray-700";
}
