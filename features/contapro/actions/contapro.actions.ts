"use server";

import { revalidatePath } from "next/cache";

import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

import { analizarArchivoContapro } from "../services/contapro-parser.service";
import type {
  ContaproAnalisis,
  ContaproImportItem,
  ContaproPeriodo,
  ContaproResumenMes,
  ContaproTipo,
} from "../types/contapro.types";

function esTablaFaltante(mensaje?: string): boolean {
  return (
    /relation .* does not exist/i.test(mensaje ?? "") ||
    /does not exist in the schema cache/i.test(mensaje ?? "")
  );
}

function mensajeTablaFaltante(): string {
  return "Las tablas del vínculo contable aún no existen en la base. Ejecuta «npx supabase db push» para aplicar la migración pendiente.";
}

function pad(valor: number): string {
  return String(valor).padStart(2, "0");
}

type DatosFormulario =
  | { ok: false; mensaje: string }
  | {
      ok: true;
      archivo: File;
      tipo: ContaproTipo;
      desde: ContaproPeriodo;
      hasta: ContaproPeriodo;
    };

function leerFormulario(formData: FormData): DatosFormulario {
  const archivo = formData.get("archivo");

  if (!(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, mensaje: "Selecciona el archivo Excel o CSV exportado de Contapro." };
  }

  const tipoRaw = String(formData.get("tipo") ?? "compras");
  const tipo: ContaproTipo = tipoRaw === "ventas" ? "ventas" : "compras";

  const mesDesde = Number(formData.get("mesDesde"));
  const anioDesde = Number(formData.get("anioDesde"));
  const mesHasta = Number(formData.get("mesHasta"));
  const anioHasta = Number(formData.get("anioHasta"));

  const periodoValido = (mes: number, anio: number) =>
    mes >= 1 && mes <= 12 && anio >= 2000 && anio <= 2100;

  if (!periodoValido(mesDesde, anioDesde) || !periodoValido(mesHasta, anioHasta)) {
    return { ok: false, mensaje: "Selecciona un mes y año válidos para el período." };
  }

  const desde = { mes: mesDesde, anio: anioDesde };
  const hasta = { mes: mesHasta, anio: anioHasta };

  if (hasta.anio * 100 + hasta.mes < desde.anio * 100 + desde.mes) {
    return { ok: false, mensaje: "El mes final no puede ser anterior al mes inicial." };
  }

  return { ok: true, archivo, tipo, desde, hasta };
}

export async function analizarContaproAction(
  formData: FormData
): Promise<ContaproAnalisis> {
  const datos = leerFormulario(formData);

  if (!datos.ok) {
    return {
      ok: false,
      mensaje: datos.mensaje,
      columnas: {
        fecha: null,
        documento: null,
        tercero: null,
        ruc: null,
        subtotal: null,
        igv: null,
        total: null,
      },
      filasValidas: 0,
      filasFueraPeriodo: 0,
      filasSinTotal: 0,
      total: 0,
      igv: 0,
      primerFecha: null,
      ultimaFecha: null,
      porMes: [],
    };
  }

  const { analisis } = await analizarArchivoContapro(
    datos.archivo,
    datos.tipo,
    datos.desde,
    datos.hasta
  );

  return analisis;
}

export async function confirmarContaproAction(
  formData: FormData
): Promise<ContaproAnalisis & { importId?: string }> {
  const datos = leerFormulario(formData);

  const base: ContaproAnalisis = {
    ok: false,
    columnas: {
      fecha: null,
      documento: null,
      tercero: null,
      ruc: null,
      subtotal: null,
      igv: null,
      total: null,
    },
    filasValidas: 0,
    filasFueraPeriodo: 0,
    filasSinTotal: 0,
    total: 0,
    igv: 0,
    primerFecha: null,
    ultimaFecha: null,
    porMes: [],
  };

  if (!datos.ok) {
    return { ...base, mensaje: datos.mensaje };
  }

  const { analisis, movimientos } = await analizarArchivoContapro(
    datos.archivo,
    datos.tipo,
    datos.desde,
    datos.hasta
  );

  if (!analisis.ok) {
    return analisis;
  }

  const { supabase, tenantId } = await getFoodOSSession();

  const { data: importRow, error: importError } = await supabase
    .from("contapro_imports")
    .insert({
      tenant_id: tenantId,
      archivo_nombre: datos.archivo.name,
      tipo: datos.tipo,
      periodo_desde: `${datos.desde.anio}-${pad(datos.desde.mes)}-01`,
      periodo_hasta: `${datos.hasta.anio}-${pad(datos.hasta.mes)}-01`,
      total: analisis.total,
      igv: analisis.igv,
      filas: movimientos.length,
    })
    .select("id")
    .single();

  if (importError || !importRow) {
    return {
      ...base,
      mensaje: esTablaFaltante(importError?.message)
        ? mensajeTablaFaltante()
        : importError?.message ?? "No se pudo registrar la importación.",
      tablaFalta: esTablaFaltante(importError?.message),
    };
  }

  const filas = movimientos.map((m) => ({
    import_id: importRow.id,
    tenant_id: tenantId,
    tipo: datos.tipo,
    fecha: m.fecha,
    mes: m.mes,
    anio: m.anio,
    documento: m.documento,
    tercero: m.tercero,
    ruc: m.ruc,
    subtotal: m.subtotal,
    igv: m.igv,
    total: m.total,
    moneda: m.moneda,
    detalle: m.detalle,
    raw: m.raw,
  }));

  const TAMANO_LOTE = 250;

  for (let i = 0; i < filas.length; i += TAMANO_LOTE) {
    const lote = filas.slice(i, i + TAMANO_LOTE);

    const { error: loteError } = await supabase
      .from("contapro_movimientos")
      .insert(lote);

    if (loteError) {
      await supabase.from("contapro_imports").delete().eq("id", importRow.id);

      return {
        ...base,
        mensaje: loteError.message,
      };
    }
  }

  revalidatePath("/foodos/contapro");
  revalidatePath("/foodos/rentabilidad");

  return { ...analisis, importId: importRow.id };
}

export async function listarContaproImportsAction(): Promise<{
  imports: ContaproImportItem[];
  tablaFalta?: boolean;
  mensaje?: string;
}> {
  const { supabase } = await getFoodOSSession();

  const { data, error } = await supabase
    .from("contapro_imports")
    .select(
      "id, archivo_nombre, tipo, periodo_desde, periodo_hasta, total, igv, filas, creado_en"
    )
    .order("creado_en", { ascending: false })
    .limit(50);

  if (error) {
    return {
      imports: [],
      tablaFalta: esTablaFaltante(error.message),
      mensaje: esTablaFaltante(error.message)
        ? mensajeTablaFaltante()
        : error.message,
    };
  }

  return { imports: (data ?? []) as ContaproImportItem[] };
}

export async function resumenContaproAction(
  desde: ContaproPeriodo,
  hasta: ContaproPeriodo
): Promise<{
  meses: ContaproResumenMes[];
  tablaFalta?: boolean;
  mensaje?: string;
}> {
  const { supabase, tenantId } = await getFoodOSSession();

  const desdeKey = desde.anio * 100 + desde.mes;
  const hastaKey = hasta.anio * 100 + hasta.mes;

  const { data, error } = await supabase
    .from("contapro_movimientos")
    .select("tipo, mes, anio, total")
    .eq("tenant_id", tenantId)
    .gte("anio", desde.anio)
    .lte("anio", hasta.anio)
    .limit(20000);

  if (error) {
    return {
      meses: [],
      tablaFalta: esTablaFaltante(error.message),
      mensaje: esTablaFaltante(error.message)
        ? mensajeTablaFaltante()
        : error.message,
    };
  }

  const mapa = new Map<number, { ventas: number; compras: number }>();

  for (const fila of data ?? []) {
    const clave = (fila as { anio: number; mes: number }).anio * 100 +
      (fila as { mes: number }).mes;

    if (clave < desdeKey || clave > hastaKey) continue;

    const acumulado = mapa.get(clave) ?? { ventas: 0, compras: 0 };
    const total = Math.abs(Number((fila as { total: number }).total) || 0);

    if ((fila as { tipo: string }).tipo === "ventas") {
      acumulado.ventas += total;
    } else {
      acumulado.compras += total;
    }

    mapa.set(clave, acumulado);
  }

  const meses: ContaproResumenMes[] = [...mapa.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([clave, v]) => {
      const margen = v.ventas - v.compras;

      return {
        anio: Math.floor(clave / 100),
        mes: clave % 100,
        ventas: Math.round(v.ventas * 100) / 100,
        compras: Math.round(v.compras * 100) / 100,
        margen: Math.round(margen * 100) / 100,
        margenPct:
          v.ventas > 0
            ? Math.round((margen / v.ventas) * 10000) / 100
            : 0,
      };
    });

  return { meses };
}

export async function eliminarContaproImportAction(
  id: string
): Promise<{ success: boolean; mensaje?: string }> {
  const { supabase } = await getFoodOSSession();

  const { error } = await supabase
    .from("contapro_imports")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, mensaje: error.message };
  }

  revalidatePath("/foodos/contapro");
  revalidatePath("/foodos/rentabilidad");

  return { success: true };
}
