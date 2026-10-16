import ExcelJS from "exceljs";

import type {
  ContaproAnalisis,
  ContaproColumnas,
  ContaproMovimiento,
  ContaproPeriodo,
  ContaproTipo,
} from "../types/contapro.types";

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function nombreMes(mes: number): string {
  return NOMBRES_MESES[mes - 1] ?? String(mes);
}

function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 /]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumero(valor: unknown): number | null {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : null;
  }

  if (valor === null || valor === undefined) return null;

  let s = String(valor).trim();

  if (!s) return null;

  const negativo = /^\(.*\)$/.test(s) || s.startsWith("-");
  s = s.replace(/[()-]/g, "");

  const ultimaComa = s.lastIndexOf(",");
  const ultimoPunto = s.lastIndexOf(".");

  if (ultimaComa > -1 && ultimoPunto > -1) {
    s =
      ultimaComa > ultimoPunto
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "");
  } else if (ultimaComa > -1) {
    const decimales = s.length - ultimaComa - 1;
    s =
      decimales <= 2
        ? s.replace(",", ".")
        : s.replace(/,/g, "");
  }

  const n = Number(s.replace(/[^\d.]/g, ""));

  if (!Number.isFinite(n)) return null;

  return negativo ? -Math.abs(n) : n;
}

function parseFecha(valor: unknown): string | null {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }

  if (typeof valor === "number" && valor > 20000 && valor < 80000) {
    const base = new Date(Date.UTC(1899, 11, 30));
    base.setUTCDate(base.getUTCDate() + valor);
    return base.toISOString().slice(0, 10);
  }

  if (valor === null || valor === undefined) return null;

  const s = String(valor).trim();

  if (!s) return null;

  const patronISO = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (patronISO) {
    return `${patronISO[1]}-${patronISO[2].padStart(2, "0")}-${patronISO[3].padStart(2, "0")}`;
  }

  const patronLatino = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);

  if (patronLatino) {
    const dia = patronLatino[1].padStart(2, "0");
    const mes = patronLatino[2].padStart(2, "0");
    const anioRaw = patronLatino[3];
    const anio =
      anioRaw.length === 2
        ? Number(anioRaw) > 70
          ? `19${anioRaw}`
          : `20${anioRaw}`
        : anioRaw;
    return `${anio}-${mes}-${dia}`;
  }

  return null;
}

function detectarColumnas(
  encabezados: string[]
): ContaproColumnas {
  const columnas: ContaproColumnas = {
    fecha: null,
    documento: null,
    tercero: null,
    ruc: null,
    subtotal: null,
    igv: null,
    total: null,
  };

  const candidatos = (lista: string[]) =>
    encabezados.find((h) => lista.includes(normalizar(h))) ?? null;

  columnas.fecha = candidatos([
    "fecha",
    "f emision",
    "fecha emision",
    "fecha de emision",
    "f emis",
    "emision",
    "f doc",
    "fecha doc",
    "f docum",
    "fecha documento",
    "f registro",
  ]);

  columnas.documento = candidatos([
    "documento",
    "comprobante",
    "n documento",
    "numero documento",
    "tipo doc",
    "nro doc",
    "num doc",
    "serie numero",
    "referencia",
  ]);

  columnas.tercero = candidatos([
    "proveedor",
    "cliente",
    "razon social",
    "nombre",
    "entidad",
    "glosa",
    "descripcion",
  ]);

  columnas.ruc = candidatos([
    "ruc",
    "n ruc",
    "nro ruc",
    "numero ruc",
    "doc identidad",
    "nro doc identidad",
    "dni ruc",
  ]);

  columnas.subtotal = candidatos([
    "subtotal",
    "base imponible",
    "afecto",
    "valor venta",
    "valor bruto",
  ]);

  columnas.igv = candidatos(["igv", "i g v", "impuesto igv", "impuesto"]);

  const columnasTotales = encabezados.filter((h) => {
    const n = normalizar(h);
    return (
      n === "total" ||
      n === "importe total" ||
      n === "total general" ||
      n === "total s" ||
      n === "monto total" ||
      n === "total doc" ||
      n === "importe" ||
      n === "soles" ||
      n === "total soles"
    );
  });

  columnas.total =
    columnasTotales.find((h) => {
      const n = normalizar(h);
      return !n.includes("igv") && !n.includes("inafecto") && !n.includes("exonerado");
    }) ?? columnasTotales[0] ?? null;

  return columnas;
}

async function leerFilas(archivo: File): Promise<unknown[][]> {
  const buffer = Buffer.from(await archivo.arrayBuffer());
  const nombre = archivo.name.toLowerCase();

  if (nombre.endsWith(".csv") || nombre.endsWith(".txt")) {
    const texto = buffer.toString("utf8");
    const lineas = texto.split(/\r?\n/).filter((l) => l.trim());

    if (lineas.length === 0) return [];

    const delimitador = ["\t", ";", ","]
      .map((d) => ({ d, n: lineas[0].split(d).length }))
      .sort((a, b) => b.n - a.n)[0].d;

    return lineas.map((linea) =>
      linea.split(delimitador).map((celda) => celda.trim().replace(/^"|"$/g, ""))
    );
  }

  const wb = new ExcelJS.Workbook();

  type DatoExcel = Parameters<typeof wb.xlsx.load>[0];

  await wb.xlsx.load(buffer as unknown as DatoExcel);

  const hoja = wb.worksheets.find((w) => w.rowCount > 0);

  if (!hoja) return [];

  const filas: unknown[][] = [];

  hoja.eachRow({ includeEmpty: false }, (row) => {
    const valores: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      valores[col - 1] =
        cell.type === ExcelJS.ValueType.Date
          ? new Date((cell.value as Date).getTime())
          : typeof cell.value === "object" && cell.value !== null && "result" in (cell.value as object)
            ? (cell.value as { result?: unknown }).result
            : cell.value;
    });
    filas.push(valores);
  });

  return filas;
}

function detectarFilaEncabezado(
  filas: unknown[][]
): { indice: number; encabezados: string[] } | null {
  let mejor: { indice: number; encabezados: string[]; puntaje: number } | null =
    null;

  const limite = Math.min(filas.length, 25);

  for (let i = 0; i < limite; i++) {
    const textos = filas[i].map((c) => (c == null ? "" : String(c).trim()));

    if (textos.filter((t) => t).length < 2) continue;

    const columnas = detectarColumnas(
      textos.filter((t) => t) as string[]
    );

    const puntaje =
      (columnas.fecha ? 3 : 0) +
      (columnas.total ? 3 : 0) +
      (columnas.tercero ? 1 : 0) +
      (columnas.igv ? 1 : 0) +
      (columnas.documento ? 1 : 0);

    if (puntaje >= 4 && (!mejor || puntaje > mejor.puntaje)) {
      mejor = { indice: i, encabezados: textos, puntaje };
    }
  }

  if (!mejor) return null;

  return {
    indice: mejor.indice,
    encabezados: mejor.encabezados.map((t, i) => t || `Columna ${i + 1}`),
  };
}

export async function analizarArchivoContapro(
  archivo: File,
  tipo: ContaproTipo,
  desde: ContaproPeriodo,
  hasta: ContaproPeriodo
): Promise<{
  analisis: ContaproAnalisis;
  movimientos: ContaproMovimiento[];
}> {
  const resultado: ContaproAnalisis = {
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

  try {
    const filas = await leerFilas(archivo);

    if (filas.length === 0) {
      resultado.mensaje = "El archivo no contiene filas legibles.";
      return { analisis: resultado, movimientos: [] };
    }

    const encabezado = detectarFilaEncabezado(filas);

    if (!encabezado) {
      resultado.mensaje =
        "No se pudo detectar la fila de encabezados. Asegúrate de exportar el reporte de compras o ventas de Contapro con sus títulos de columna.";
      return { analisis: resultado, movimientos: [] };
    }

    const columnas = detectarColumnas(encabezado.encabezados);
    resultado.columnas = columnas;

    if (!columnas.fecha || !columnas.total) {
      resultado.mensaje = `No se detectaron las columnas de fecha y total. Columnas encontradas: ${encabezado.encabezados.filter(Boolean).join(", ")}.`;
      return { analisis: resultado, movimientos: [] };
    }

    const idx = (columna: string | null) =>
      columna ? encabezado.encabezados.indexOf(columna) : -1;

    const iFecha = idx(columnas.fecha);
    const iTotal = idx(columnas.total);
    const iDoc = idx(columnas.documento);
    const iTercero = idx(columnas.tercero);
    const iRuc = idx(columnas.ruc);
    const iSubtotal = idx(columnas.subtotal);
    const iIgv = idx(columnas.igv);

    const desdeKey = desde.anio * 100 + desde.mes;
    const hastaKey = hasta.anio * 100 + hasta.mes;

    const porMes = new Map<number, { total: number; filas: number }>();
    const movimientos: ContaproMovimiento[] = [];
    let primer: string | null = null;
    let ultimo: string | null = null;

    for (let f = encabezado.indice + 1; f < filas.length; f++) {
      const fila = filas[f];

      const fecha = parseFecha(fila[iFecha]);

      if (!fecha) continue;

      const total = parseNumero(fila[iTotal]);

      if (total === null || total === 0) {
        resultado.filasSinTotal += 1;
        continue;
      }

      const [anioStr, mesStr] = fecha.split("-");
      const mes = Number(mesStr);
      const anio = Number(anioStr);
      const clave = anio * 100 + mes;

      if (clave < desdeKey || clave > hastaKey) {
        resultado.filasFueraPeriodo += 1;
        continue;
      }

      const tercero = iTercero > -1 ? String(fila[iTercero] ?? "").trim() : "";
      const documento = iDoc > -1 ? String(fila[iDoc] ?? "").trim() : "";
      const ruc = iRuc > -1 ? String(fila[iRuc] ?? "").trim() : "";
      const igv = iIgv > -1 ? parseNumero(fila[iIgv]) : null;
      const subtotal = iSubtotal > -1 ? parseNumero(fila[iSubtotal]) : null;

      const filaObjeto: Record<string, unknown> = {};
      encabezado.encabezados.forEach((enc, i) => {
        if (enc) filaObjeto[enc] = fila[i] ?? null;
      });

      movimientos.push({
        fecha,
        mes,
        anio,
        documento: documento || null,
        tercero: tercero || null,
        ruc: ruc || null,
        subtotal,
        igv,
        total: Math.abs(total),
        moneda: "PEN",
        detalle: null,
        raw: filaObjeto,
      });

      resultado.filasValidas += 1;
      resultado.total += Math.abs(total);
      resultado.igv += igv ? Math.abs(igv) : 0;

      if (!primer || fecha < primer) primer = fecha;
      if (!ultimo || fecha > ultimo) ultimo = fecha;

      const acumulado = porMes.get(clave) ?? { total: 0, filas: 0 };
      acumulado.total += Math.abs(total);
      acumulado.filas += 1;
      porMes.set(clave, acumulado);
    }

    resultado.primerFecha = primer;
    resultado.ultimaFecha = ultimo;
    resultado.porMes = [...porMes.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([clave, v]) => ({
        anio: Math.floor(clave / 100),
        mes: clave % 100,
        total: Math.round(v.total * 100) / 100,
        filas: v.filas,
      }));

    if (resultado.filasValidas === 0) {
      resultado.mensaje =
        resultado.filasFueraPeriodo > 0
          ? "Se detectaron movimientos pero ninguno cae dentro del período seleccionado."
          : "No se detectaron movimientos válidos (fila con fecha y total) en el archivo.";
      return { analisis: resultado, movimientos: [] };
    }

    resultado.ok = true;
    resultado.total = Math.round(resultado.total * 100) / 100;
    resultado.igv = Math.round(resultado.igv * 100) / 100;

    return { analisis: resultado, movimientos };
  } catch (error) {
    resultado.mensaje =
      error instanceof Error
        ? `No se pudo leer el archivo: ${error.message}`
        : "No se pudo leer el archivo.";

    return { analisis: resultado, movimientos: [] };
  }
}
