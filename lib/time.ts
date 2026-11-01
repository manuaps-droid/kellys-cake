/**
 * Zona horaria de Lima (UTC-5) — única fuente de verdad.
 * Perú no observa DST actualmente, pero si lo adopta, este es
 * el único archivo a actualizar.
 */

export function horaLima(): Date {
  return new Date(Date.now() - 5 * 60 * 60 * 1000);
}

export function claveMes(fecha: Date): string {
  return fecha.toISOString().slice(0, 7);
}

export function mesAnterior(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  const d = new Date(Date.UTC(anio, mes - 2, 1));
  return d.toISOString().slice(0, 7);
}

/**
 * Clave de mes de hace N meses atrás (Lima), para bounds de queries.
 * Ej: claveMesHace(6) → primer mes de una ventana de 6 meses.
 */
export function claveMesHace(mesesAtras: number): string {
  const lima = horaLima();
  const [anio, mes] = claveMes(lima).split("-").map(Number);
  let m = mes - mesesAtras;
  let a = anio;
  while (m <= 0) {
    m += 12;
    a -= 1;
  }
  return `${a}-${String(m).padStart(2, "0")}`;
}
