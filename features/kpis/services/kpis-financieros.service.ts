import { createAdminClient } from "@/lib/supabase/admin";

export type FilaMesKpi = {
  mes: string;
  etiqueta: string;
  ventas: number;
  utilidad: number | null;
};

export type DatosKpisFinancieros = {
  ventasMes: number;
  costosFijos: Array<{ id: string; concepto: string; monto: number }>;
  totalCostosFijos: number;
  inversion: number;
  patrimonio: number;
  mcPctProm: number;
  mcUnitProm: number;
  utilidadMes: number | null;
  ros: number | null;
  roi: number | null;
  roe: number | null;
  peUnidades: number | null;
  peSoles: number | null;
  serieMensual: FilaMesKpi[];
};

type AporteReceta = {
  precio: number;
  mcPct: number;
  mcUnit: number;
};

/**
 * KPIs financieros del mes: ROS, ROI, ROE y punto de equilibrio.
 * Utiliza ventas reales del mes (pedidos), los costos fijos de la
 * tabla foodos_costos_fijos (misma fuente que el costeo 4 capas) y
 * el margen de contribución promedio de los productos con receta.
 */
export async function getKpisFinancieros(
  conCosteo: AporteReceta[]
): Promise<DatosKpisFinancieros> {
  const supabase = createAdminClient();

  // Ventas del mes actual (hora Lima, mismo criterio que Pulso del Negocio)
  const lima = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const mesActual = lima.toISOString().slice(0, 7);
  const { data: pedidosRows } = await supabase
    .from("pedidos")
    .select("total, created_at")
    .neq("estado", "cancelado");
  const ventasMes = (pedidosRows ?? [])
    .filter((p: { created_at: string | null }) =>
      String(p.created_at ?? "").slice(0, 7) === mesActual
    )
    .reduce((t: number, p: { total: number | null }) => t + Number(p.total ?? 0), 0);

  // Costos fijos mensuales (misma tabla que alimenta el costeo 4 capas)
  const { data: costosFijosDB } = await supabase
    .from("foodos_costos_fijos")
    .select("id, concepto, monto_mensual")
    .eq("activo", true);
  const costosFijos = (costosFijosDB ?? []).map(
    (c: { id: string; concepto: string; monto_mensual: number }) => ({
      id: c.id,
      concepto: c.concepto,
      monto: Number(c.monto_mensual) || 0,
    })
  );
  const totalCostosFijos = costosFijos.reduce((t, c) => t + c.monto, 0);

  // Inversión y patrimonio guardados (para ROI/ROE)
  const { data: configKpisRow } = await supabase
    .from("tienda_config")
    .select("data")
    .eq("seccion", "foodos_config_kpis")
    .maybeSingle();
  const configKpis = (configKpisRow?.data as
    | { inversion_total?: number; patrimonio?: number }
    | null) ?? {};
  const inversion = Number(configKpis.inversion_total) || 0;
  const patrimonio = Number(configKpis.patrimonio) || 0;

  // Promedios de margen de contribución (solo productos con precio)
  const conPrecio = conCosteo.filter((x) => x.precio > 0);
  const mcPctProm =
    conPrecio.length > 0
      ? conPrecio.reduce((t, x) => t + x.mcPct, 0) / conPrecio.length
      : 0;
  const mcUnitProm =
    conPrecio.length > 0
      ? conPrecio.reduce((t, x) => t + x.mcUnit, 0) / conPrecio.length
      : 0;

  const utilidadMes =
    conPrecio.length > 0
      ? ventasMes * (mcPctProm / 100) - totalCostosFijos
      : null;
  const ros =
    ventasMes > 0 && utilidadMes != null
      ? (utilidadMes / ventasMes) * 100
      : null;
  const roi =
    inversion > 0 && utilidadMes != null
      ? ((utilidadMes * 12) / inversion) * 100
      : null;
  const roe =
    patrimonio > 0 && utilidadMes != null
      ? ((utilidadMes * 12) / patrimonio) * 100
      : null;
  const peUnidades =
    mcUnitProm > 0 && totalCostosFijos > 0
      ? totalCostosFijos / mcUnitProm
      : null;
  const peSoles =
    mcPctProm > 0 && totalCostosFijos > 0
      ? totalCostosFijos / (mcPctProm / 100)
      : null;

  // ── Serie mensual: ventas por mes (últimos 6 meses, hora Lima) ──
  const MESES_ABREV = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Set", "Oct", "Nov", "Dic",
  ];
  const N_MESES = 6;

  const ventasPorMes = new Map<string, number>();
  for (const p of (pedidosRows ?? []) as Array<{
    total: number | null;
    created_at: string | null;
  }>) {
    const clave = String(p.created_at ?? "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(clave)) continue;
    ventasPorMes.set(clave, (ventasPorMes.get(clave) ?? 0) + Number(p.total ?? 0));
  }

  const [anioStr, mesStr] = mesActual.split("-").map(Number);
  const serieMensual: FilaMesKpi[] = [];

  for (let i = N_MESES - 1; i >= 0; i--) {
    let m = mesStr - i;
    let a = anioStr;
    while (m <= 0) {
      m += 12;
      a -= 1;
    }
    const clave = `${a}-${String(m).padStart(2, "0")}`;
    const ventas = ventasPorMes.get(clave) ?? 0;
    const utilidad =
      conPrecio.length > 0
        ? ventas * (mcPctProm / 100) - totalCostosFijos
        : null;

    serieMensual.push({
      mes: clave,
      etiqueta: MESES_ABREV[m - 1],
      ventas: Math.round(ventas * 100) / 100,
      utilidad: utilidad != null ? Math.round(utilidad * 100) / 100 : null,
    });
  }

  return {
    ventasMes: Math.round(ventasMes * 100) / 100,
    costosFijos,
    totalCostosFijos,
    inversion,
    patrimonio,
    mcPctProm,
    mcUnitProm,
    utilidadMes: utilidadMes != null ? Math.round(utilidadMes * 100) / 100 : null,
    ros: ros != null ? Math.round(ros * 10) / 10 : null,
    roi: roi != null ? Math.round(roi * 10) / 10 : null,
    roe: roe != null ? Math.round(roe * 10) / 10 : null,
    peUnidades: peUnidades != null ? Math.round(peUnidades * 10) / 10 : null,
    peSoles: peSoles != null ? Math.round(peSoles * 100) / 100 : null,
    serieMensual,
  };
}
