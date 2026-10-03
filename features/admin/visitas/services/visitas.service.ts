import { createAdminClient } from "@/lib/supabase/admin";
import type { ResumenVisitas, VisitaDia } from "../types/visitas.type";

const SECCION_ANALYTICS = "analytics_visitas";

export function getFechaPeru(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

type StoredDia = {
  total: number;
  unicos: number;
  visitor_ids?: string[];
  rutas: Record<string, number>;
  dispositivos: {
    movil: number;
    desktop: number;
  };
};

type StoredAnalytics = {
  total_historico: number;
  dias: Record<string, StoredDia>;
};

/**
 * Registra una visita en el contador diario.
 * Se ejecuta de forma asíncrona y tolerante a fallos.
 */
export async function registrarVisitaService(input: {
  path: string;
  visitorId: string;
  isMobile: boolean;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const hoy = getFechaPeru();
    const pathSanitized = input.path.slice(0, 100);

    const { data: row } = await admin
      .from("tienda_config")
      .select("data")
      .eq("seccion", SECCION_ANALYTICS)
      .maybeSingle();

    const stored: StoredAnalytics = (row?.data as StoredAnalytics) || {
      total_historico: 0,
      dias: {},
    };

    if (!stored.dias) stored.dias = {};

    const diaActual: StoredDia = stored.dias[hoy] || {
      total: 0,
      unicos: 0,
      visitor_ids: [],
      rutas: {},
      dispositivos: { movil: 0, desktop: 0 },
    };

    if (!diaActual.rutas) diaActual.rutas = {};
    if (!diaActual.dispositivos) diaActual.dispositivos = { movil: 0, desktop: 0 };
    if (!Array.isArray(diaActual.visitor_ids)) diaActual.visitor_ids = [];

    // Incrementar visita total
    diaActual.total = (diaActual.total || 0) + 1;
    stored.total_historico = (stored.total_historico || 0) + 1;

    // Incrementar contador por ruta
    diaActual.rutas[pathSanitized] = (diaActual.rutas[pathSanitized] || 0) + 1;

    // Incrementar dispositivo
    if (input.isMobile) {
      diaActual.dispositivos.movil = (diaActual.dispositivos.movil || 0) + 1;
    } else {
      diaActual.dispositivos.desktop = (diaActual.dispositivos.desktop || 0) + 1;
    }

    // Verificar si es un visitante único para este día
    if (input.visitorId && !diaActual.visitor_ids.includes(input.visitorId)) {
      if (diaActual.visitor_ids.length < 5000) {
        diaActual.visitor_ids.push(input.visitorId);
      }
      diaActual.unicos = (diaActual.unicos || 0) + 1;
    } else if (diaActual.unicos === 0) {
      diaActual.unicos = 1;
    }

    stored.dias[hoy] = diaActual;

    // Limpiar arrays de IDs de días de más de 14 días para mantener el JSON ultraligero
    const hace14Dias = getFechaPeru(-14);
    for (const key of Object.keys(stored.dias)) {
      if (key < hace14Dias && stored.dias[key].visitor_ids) {
        delete stored.dias[key].visitor_ids;
      }
    }

    await admin.from("tienda_config").upsert({
      seccion: SECCION_ANALYTICS,
      data: stored,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error al registrar visita:", err);
  }
}

/**
 * Obtiene el resumen consolidado de visitas diarias para el panel administrativo.
 */
export async function getResumenVisitasService(): Promise<ResumenVisitas> {
  const admin = createAdminClient();
  const hoyStr = getFechaPeru(0);
  const ayerStr = getFechaPeru(-1);

  const { data: row } = await admin
    .from("tienda_config")
    .select("data")
    .eq("seccion", SECCION_ANALYTICS)
    .maybeSingle();

  const stored: StoredAnalytics = (row?.data as StoredAnalytics) || {
    total_historico: 0,
    dias: {},
  };

  const dias = stored.dias || {};

  const hoyData = dias[hoyStr] || { total: 0, unicos: 0 };
  const ayerData = dias[ayerStr] || { total: 0, unicos: 0 };

  // Construir historial de los últimos 30 días
  const historialDias: VisitaDia[] = [];
  let u7Total = 0;
  let u7Unicos = 0;
  let u30Total = 0;
  let u30Unicos = 0;
  const rutasMap: Record<string, number> = {};

  for (let i = 0; i < 30; i++) {
    const f = getFechaPeru(-i);
    const d = dias[f] || {
      total: 0,
      unicos: 0,
      rutas: {},
      dispositivos: { movil: 0, desktop: 0 },
    };

    const visitaDia: VisitaDia = {
      fecha: f,
      total: d.total || 0,
      unicos: d.unicos || 0,
      rutas: d.rutas || {},
      dispositivos: d.dispositivos || { movil: 0, desktop: 0 },
    };

    historialDias.push(visitaDia);

    u30Total += visitaDia.total;
    u30Unicos += visitaDia.unicos;

    if (i < 7) {
      u7Total += visitaDia.total;
      u7Unicos += visitaDia.unicos;
    }

    if (d.rutas) {
      for (const [r, count] of Object.entries(d.rutas)) {
        rutasMap[r] = (rutasMap[r] || 0) + count;
      }
    }
  }

  // Top páginas ordenadas por visualizaciones
  const topRutas = Object.entries(rutasMap)
    .map(([ruta, visitas]) => ({ ruta, visitas }))
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 10);

  return {
    hoy: { total: hoyData.total || 0, unicos: hoyData.unicos || 0 },
    ayer: { total: ayerData.total || 0, unicos: ayerData.unicos || 0 },
    ultimos7Dias: { total: u7Total, unicos: u7Unicos },
    ultimos30Dias: { total: u30Total, unicos: u30Unicos },
    totalHistorico: stored.total_historico || u30Total,
    historialDias,
    topRutas,
  };
}
