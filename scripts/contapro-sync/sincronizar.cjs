/**
 * FoodOS · Agente sincronizador Contapro
 * ---------------------------------------------------------
 * Lee los reportes Excel/CSV que exporta Contapro en una
 * carpeta de tu PC y los envía automáticamente al panel
 * FoodOS (kellyscake.pe). Los archivos procesados se mueven
 * a la subcarpeta "procesados" para no duplicar.
 *
 * Uso:       node sincronizar.cjs
 * Programa:  schtasks /Create /SC DAILY /ST 09:30 /TN "FoodOS Contapro" /TR "node C:\Contapro\sync\sincronizar.cjs"
 */

const fs = require("node:fs");
const path = require("node:path");

function cargarConfig() {
  const ruta = path.join(__dirname, "config.json");

  if (!fs.existsSync(ruta)) {
    console.error(
      "ERROR: falta config.json. Copia config.example.json como config.json y complétalo."
    );
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(ruta, "utf-8"));

  if (!config.endpoint || !config.secret || !config.carpeta) {
    console.error("ERROR: config.json necesita endpoint, secret y carpeta.");
    process.exit(1);
  }

  return config;
}

function normalizar(valor) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 /]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
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
    const dec = s.length - ultimaComa - 1;
    s = dec <= 2 ? s.replace(",", ".") : s.replace(/,/g, "");
  }

  const n = Number(s.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return null;

  return negativo ? -Math.abs(n) : n;
}

function parseFecha(valor) {
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

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const latino = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (latino) {
    const anio =
      latino[3].length === 2
        ? Number(latino[3]) > 70
          ? `19${latino[3]}`
          : `20${latino[3]}`
        : latino[3];
    return `${anio}-${latino[2].padStart(2, "0")}-${latino[1].padStart(2, "0")}`;
  }

  return null;
}

function detectarColumnas(encabezados) {
  const candidatos = (lista) =>
    encabezados.find((h) => lista.includes(normalizar(h))) ?? null;

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

  return {
    fecha: candidatos([
      "fecha", "f emision", "fecha emision", "fecha de emision",
      "f emis", "emision", "f doc", "fecha doc", "f registro",
    ]),
    documento: candidatos([
      "documento", "comprobante", "n documento", "numero documento",
      "tipo doc", "nro doc", "num doc", "referencia",
    ]),
    tercero: candidatos([
      "proveedor", "cliente", "razon social", "nombre", "entidad", "glosa", "descripcion",
    ]),
    ruc: candidatos(["ruc", "n ruc", "nro ruc", "numero ruc", "doc identidad"]),
    subtotal: candidatos(["subtotal", "base imponible", "afecto", "valor venta"]),
    igv: candidatos(["igv", "i g v", "impuesto igv", "impuesto"]),
    total:
      columnasTotales.find((h) => {
        const n = normalizar(h);
        return !n.includes("igv") && !n.includes("inafecto") && !n.includes("exonerado");
      }) ?? columnasTotales[0] ?? null,
  };
}

async function leerFilas(archivo) {
  if (archivo.toLowerCase().endsWith(".csv") || archivo.toLowerCase().endsWith(".txt")) {
    const texto = fs.readFileSync(archivo, "utf8");
    const lineas = texto.split(/\r?\n/).filter((l) => l.trim());
    if (lineas.length === 0) return [];

    const delimitador = ["\t", ";", ","]
      .map((d) => ({ d, n: lineas[0].split(d).length }))
      .sort((a, b) => b.n - a.n)[0].d;

    return lineas.map((linea) =>
      linea.split(delimitador).map((c) => c.trim().replace(/^"|"$/g, ""))
    );
  }

  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(fs.readFileSync(archivo));

  const hoja = wb.worksheets.find((w) => w.rowCount > 0);
  if (!hoja) return [];

  const filas = [];
  hoja.eachRow({ includeEmpty: false }, (row) => {
    const valores = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      valores[col - 1] =
        cell.type === ExcelJS.ValueType.Date
          ? new Date(cell.value.getTime())
          : cell.value && typeof cell.value === "object" && "result" in cell.value
            ? cell.value.result
            : cell.value;
    });
    filas.push(valores);
  });

  return filas;
}

function detectarEncabezados(filas) {
  let mejor = null;
  const limite = Math.min(filas.length, 25);

  for (let i = 0; i < limite; i++) {
    const textos = filas[i].map((c) => (c == null ? "" : String(c).trim()));

    if (textos.filter((t) => t).length < 2) continue;

    const columnas = detectarColumnas(textos.filter((t) => t));

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

async function analizarArchivo(archivo) {
  const filas = await leerFilas(archivo);

  if (filas.length === 0) {
    return { ok: false, mensaje: "El archivo está vacío." };
  }

  const encabezado = detectarEncabezados(filas);

  if (!encabezado) {
    return {
      ok: false,
      mensaje: "No se detectó la fila de encabezados del reporte Contapro.",
    };
  }

  const columnas = detectarColumnas(encabezado.encabezados);

  if (!columnas.fecha || !columnas.total) {
    return {
      ok: false,
      mensaje: "No se detectaron las columnas de fecha y total.",
    };
  }

  const idx = (c) => (c ? encabezado.encabezados.indexOf(c) : -1);
  const iFecha = idx(columnas.fecha);
  const iTotal = idx(columnas.total);
  const iDoc = idx(columnas.documento);
  const iTercero = idx(columnas.tercero);
  const iRuc = idx(columnas.ruc);
  const iIgv = idx(columnas.igv);
  const iSubtotal = idx(columnas.subtotal);

  const movimientos = [];

  for (let f = encabezado.indice + 1; f < filas.length; f++) {
    const fila = filas[f];
    const fecha = parseFecha(fila[iFecha]);
    if (!fecha) continue;

    const total = parseNumero(fila[iTotal]);
    if (total === null || total === 0) continue;

    movimientos.push({
      fecha,
      total,
      documento: iDoc > -1 ? String(fila[iDoc] ?? "").trim() : "",
      tercero: iTercero > -1 ? String(fila[iTercero] ?? "").trim() : "",
      ruc: iRuc > -1 ? String(fila[iRuc] ?? "").trim() : "",
      igv: iIgv > -1 ? parseNumero(fila[iIgv]) : null,
      subtotal: iSubtotal > -1 ? parseNumero(fila[iSubtotal]) : null,
    });
  }

  if (movimientos.length === 0) {
    return { ok: false, mensaje: "Sin movimientos válidos en el archivo." };
  }

  return { ok: true, movimientos };
}

function periodoSegunConfig(config) {
  const meses = Math.max(1, Number(config.meses_atras) || 3);
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setMonth(desde.getMonth() - (meses - 1));

  return {
    desde: { mes: desde.getMonth() + 1, anio: desde.getFullYear() },
    hasta: { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() },
  };
}

async function sincronizarArchivo(config, archivo) {
  const nombre = path.basename(archivo);
  const nombreLower = nombre.toLowerCase();

  let tipo = null;
  if (/compra/.test(nombreLower)) tipo = "compras";
  else if (/venta/.test(nombreLower)) tipo = "ventas";

  if (!tipo) {
    console.log(
      `⚠ "${nombre}": el nombre no contiene "compra" ni "venta". Renómbralo (ej: registro-compras-octubre.xlsx) y vuelve a ejecutar.`
    );
    return;
  }

  const analisis = await analizarArchivo(archivo);

  if (!analisis.ok) {
    console.log(`⚠ "${nombre}": ${analisis.mensaje}`);
    return;
  }

  const respuesta = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": config.secret,
    },
    body: JSON.stringify({
      tipo,
      archivo_nombre: nombre,
      periodo: periodoSegunConfig(config),
      movimientos: analisis.movimientos,
    }),
  });

  const data = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok || !data.ok) {
    console.log(
      `✗ "${nombre}": ${data.error ?? `error HTTP ${respuesta.status}`}`
    );
    return;
  }

  const resumen =
    data.duplicado
      ? "ya estaba sincronizado (omitido)"
      : `${data.importadas} movimientos · S/ ${(data.total ?? 0).toFixed(2)}`;

  console.log(`✓ "${nombre}": ${resumen}`);

  const carpetaProcesados = path.join(config.carpeta, "procesados");
  if (!fs.existsSync(carpetaProcesados)) {
    fs.mkdirSync(carpetaProcesados, { recursive: true });
  }

  fs.renameSync(archivo, path.join(carpetaProcesados, nombre));
}

async function main() {
  console.log("FoodOS · Sincronizador Contapro");
  console.log("--------------------------------");

  const config = cargarConfig();

  if (!fs.existsSync(config.carpeta)) {
    console.error(`ERROR: la carpeta "${config.carpeta}" no existe.`);
    process.exit(1);
  }

  const archivos = fs
    .readdirSync(config.carpeta)
    .filter(
      (f) =>
        f.toLowerCase().endsWith(".xlsx") ||
        f.toLowerCase().endsWith(".csv") ||
        f.toLowerCase().endsWith(".txt")
    )
    .map((f) => path.join(config.carpeta, f));

  if (archivos.length === 0) {
    console.log("No hay archivos nuevos para sincronizar.");
    return;
  }

  for (const archivo of archivos) {
    try {
      await sincronizarArchivo(config, archivo);
    } catch (err) {
      console.error(`✗ Error procesando ${path.basename(archivo)}:`, err.message);
    }
  }

  console.log("--------------------------------");
  console.log("Sincronización terminada.");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
