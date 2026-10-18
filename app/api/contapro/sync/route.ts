import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type MovimientoSync = {
  fecha?: unknown;
  total?: unknown;
  documento?: unknown;
  tercero?: unknown;
  ruc?: unknown;
  igv?: unknown;
  subtotal?: unknown;
};

const MAX_FILAS = 5000;
const TAMANO_LOTE = 250;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fechaValida(s: unknown): s is string {
  if (typeof s !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;

  const d = new Date(`${s}T00:00:00Z`);

  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === s
  );
}

function textoCorto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;

  const limpio = valor.trim().slice(0, max);

  return limpio === "" ? null : limpio;
}

/**
 * Endpoint de sincronización automática Contapro → FoodOS.
 * Lo consume el agente instalado en el equipo donde corre
 * Contapro (scripts/contapro-sync), autenticándose con
 * CONTAPRO_SYNC_SECRET. No requiere sesión de usuario.
 */
export async function POST(request: Request) {
  const secret = process.env.CONTAPRO_SYNC_SECRET;
  const recibido = request.headers.get("x-sync-secret");

  if (!secret || recibido !== secret) {
    return NextResponse.json(
      { ok: false, error: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const tipo =
      body?.tipo === "ventas"
        ? "ventas"
        : body?.tipo === "compras"
          ? "compras"
          : null;

    const archivo =
      typeof body?.archivo_nombre === "string"
        ? body.archivo_nombre.slice(0, 180)
        : "";

    const desde = body?.periodo?.desde;
    const hasta = body?.periodo?.hasta;

    let movimientos: MovimientoSync[] = Array.isArray(
      body?.movimientos
    )
      ? body.movimientos
      : [];

    if (
      !tipo ||
      !archivo ||
      !desde?.mes ||
      !desde?.anio ||
      !hasta?.mes ||
      !hasta?.anio
    ) {
      return NextResponse.json(
        { ok: false, error: "Payload inválido." },
        { status: 400 }
      );
    }

    if (movimientos.length === 0) {
      return NextResponse.json({
        ok: true,
        importadas: 0,
        mensaje: "Sin movimientos en el lote.",
      });
    }

    if (movimientos.length > MAX_FILAS) {
      movimientos = movimientos.slice(0, MAX_FILAS);
    }

    const desdeKey = desde.anio * 100 + desde.mes;
    const hastaKey = hasta.anio * 100 + hasta.mes;

    const filas: Array<{
      fecha: string;
      mes: number;
      anio: number;
      documento: string | null;
      tercero: string | null;
      ruc: string | null;
      igv: number | null;
      subtotal: number | null;
      total: number;
    }> = [];

    let totalLote = 0;
    let igvLote = 0;

    for (const m of movimientos) {
      if (!fechaValida(m.fecha)) continue;

      const total = Number(m.total);

      if (!Number.isFinite(total) || total === 0) continue;

      const fecha = m.fecha as string;
      const mes = Number(fecha.slice(5, 7));
      const anio = Number(fecha.slice(0, 4));
      const clave = anio * 100 + mes;

      if (clave < desdeKey || clave > hastaKey) continue;

      const igv = Number(m.igv);
      const subtotal = Number(m.subtotal);

      filas.push({
        fecha,
        mes,
        anio,
        documento: textoCorto(m.documento, 120),
        tercero: textoCorto(m.tercero, 240),
        ruc: textoCorto(m.ruc, 20),
        igv: Number.isFinite(igv) ? Math.abs(igv) : null,
        subtotal: Number.isFinite(subtotal)
          ? Math.abs(subtotal)
          : null,
        total: Math.abs(total),
      });

      totalLote += Math.abs(total);
      if (Number.isFinite(igv)) igvLote += Math.abs(igv);
    }

    if (filas.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ningún movimiento del lote es válido o cae dentro del período.",
        },
        { status: 400 }
      );
    }

    totalLote = Math.round(totalLote * 100) / 100;
    igvLote = Math.round(igvLote * 100) / 100;

    const periodoDesde = `${desde.anio}-${pad(desde.mes)}-01`;
    const periodoHasta = `${hasta.anio}-${pad(hasta.mes)}-01`;

    const supabase = createAdminClient();

    // Deduplicación: el mismo archivo + tipo + período ya sincronizado
    const { data: duplicado } = await supabase
      .from("contapro_imports")
      .select("id")
      .eq("archivo_nombre", archivo)
      .eq("tipo", tipo)
      .eq("periodo_desde", periodoDesde)
      .eq("periodo_hasta", periodoHasta)
      .maybeSingle();

    if (duplicado) {
      return NextResponse.json({
        ok: true,
        duplicado: true,
        mensaje: "Este lote ya estaba sincronizado. Nada duplicado.",
      });
    }

    // Tenant de FoodOS (mismo criterio que la sesión de FoodOS)
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!tenant?.id) {
      return NextResponse.json(
        { ok: false, error: "Tenant de FoodOS no encontrado." },
        { status: 500 }
      );
    }

    const { data: importRow, error: importError } = await supabase
      .from("contapro_imports")
      .insert({
        tenant_id: tenant.id,
        archivo_nombre: archivo,
        tipo,
        periodo_desde: periodoDesde,
        periodo_hasta: periodoHasta,
        total: totalLote,
        igv: igvLote,
        filas: filas.length,
      })
      .select("id")
      .single();

    if (importError || !importRow) {
      return NextResponse.json(
        { ok: false, error: importError?.message ?? "No se pudo registrar el lote." },
        { status: 500 }
      );
    }

    for (let i = 0; i < filas.length; i += TAMANO_LOTE) {
      const lote = filas
        .slice(i, i + TAMANO_LOTE)
        .map((f) => ({
          import_id: importRow.id,
          tenant_id: tenant.id,
          tipo,
          fecha: f.fecha,
          mes: f.mes,
          anio: f.anio,
          documento: f.documento,
          tercero: f.tercero,
          ruc: f.ruc,
          subtotal: f.subtotal,
          igv: f.igv,
          total: f.total,
          moneda: "PEN",
        }));

      const { error: loteError } = await supabase
        .from("contapro_movimientos")
        .insert(lote);

      if (loteError) {
        await supabase
          .from("contapro_imports")
          .delete()
          .eq("id", importRow.id);

        return NextResponse.json(
          { ok: false, error: loteError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      importadas: filas.length,
      total: totalLote,
    });
  } catch (error) {
    console.error("[contapro-sync] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno." },
      { status: 500 }
    );
  }
}
