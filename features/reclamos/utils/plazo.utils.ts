/**
 * Suma días hábiles (lunes a viernes) a una fecha.
 * Usado para calcular el plazo legal de respuesta del
 * Libro de Reclamaciones (15 días hábiles).
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  let restantes = days;

  while (restantes > 0) {
    result.setDate(result.getDate() + 1);
    const dia = result.getDay();
    if (dia !== 0 && dia !== 6) {
      restantes -= 1;
    }
  }

  return result;
}

export type EstadoPlazo = "resuelto" | "vencido" | "en_plazo";

export function evaluarPlazo(
  createdAt: string,
  respondidoAt: string | null,
  ahora = new Date()
): { estado: EstadoPlazo; limite: Date } {
  const limite = addBusinessDays(new Date(createdAt), 15);

  if (respondidoAt) return { estado: "resuelto", limite };
  if (ahora > limite) return { estado: "vencido", limite };

  return { estado: "en_plazo", limite };
}

/**
 * Días hábiles (lun-vie) que faltan desde ahora hasta la fecha límite.
 */
export function diasHabilesRestantes(
  limite: Date,
  ahora = new Date()
): number {
  const soloDia = (d: Date) =>
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  let cursor = new Date(soloDia(ahora));
  const fin = new Date(soloDia(limite));

  let count = 0;
  while (cursor <= fin) {
    const dia = cursor.getUTCDay();
    if (dia !== 0 && dia !== 6) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return count;
}
