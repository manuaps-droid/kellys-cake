"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export type BorradorInput = {
  id: string;
  numero: string;
  tipo: string;
  nombres: string;
  producto_servicio: string;
  monto_reclamado: number;
  fecha_registro: string;
  descripcion: string;
  peticion: string;
};

type BorradorResult =
  | { success: true; borrador: string; modo: "ia" | "plantilla" }
  | { success: false; message: string };

const SYSTEM_PROMPT = `Eres el asistente de servicio al cliente de Kelly's Cake, una repostería artesanal de Arequipa, Perú.
Redacta borradores de respuesta para el Libro de Reclamaciones conforme a la normativa peruana de consumo.

Reglas:
- Español peruano, tono formal pero cálido y empático.
- Estructura: saludo por el nombre, acuse de recibo citando el número y tipo de solicitud, referencia al producto y monto, disculpa sincera, propuesta de solución concreta coherente con la petición del consumidor, cierre con datos de seguimiento y firma "Kelly's Cake — Atención al Cliente".
- NO inventes datos que no te den (fechas de compra, nombres de empleados, montos distintos).
- Si la petición pide devolución de dinero, ofrece el reembolso del monto reclamado. Si pide cambio o reposición, ofrecela sin costo.
- Máximo 220 palabras. Devuelve SOLO el texto de la carta, sin encabezados markdown ni comillas.`;

function componerPlantilla(d: BorradorInput): string {
  const tipoLabel = d.tipo === "reclamo" ? "reclamo" : "queja";
  const fecha = new Date(d.fecha_registro).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const monto = Number(d.monto_reclamado).toFixed(2);

  const texto = `${d.descripcion} ${d.peticion}`.toLowerCase();

  let solucion: string;
  if (/devoluci|dinero|reembols/.test(texto)) {
    solucion = `procederemos con la devolución íntegra de S/ ${monto} a través del mismo medio de pago utilizado en tu compra, dentro de los próximos 5 días hábiles`;
  } else if (/cambio|repo|nuevo producto|reemplaz/.test(texto)) {
    solucion = `repondremos el producto sin costo adicional alguno, coordinando contigo la nueva fecha de entrega que mejor te acomode`;
  } else if (d.tipo === "queja") {
    solucion = `hemos reforzado nuestro protocolo de atención al cliente para que esta situación no se repita. Agradecemos sinceramente tus comentarios, pues nos ayudan a mejorar cada día`;
  } else {
    solucion = `coordinaremos directamente contigo una solución acorde a tu petición, comunicándonos a tu teléfono o correo en las próximas horas`;
  }

  return `Estimado(a) ${d.nombres}:

Recibimos tu ${tipoLabel} con número ${d.numero}, registrada el ${fecha}, relacionada con "${d.producto_servicio}" por un monto reclamado de S/ ${monto}.

Luego de revisar cuidadosamente los hechos que nos describiste, queremos ofrecerte una sincera disculpa por la experiencia vivida. Tu confianza es muy valiosa para nosotros, y ${solucion}.

Te recordamos que puedes hacer seguimiento de esta solicitud citando el número ${d.numero}. Si deseas comentarnos algo adicional, escríbenos o visítanos en nuestra tienda; será un gusto atenderte.

Agradecemos tu paciencia y preferencia.

Atentamente,
Kelly's Cake — Atención al Cliente
Arequipa, Perú`.replace(/[ \t]+\n/g, "\n");
}

async function generarConIA(d: BorradorInput): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              numero: d.numero,
              tipo: d.tipo,
              consumidor: d.nombres,
              producto_servicio: d.producto_servicio,
              monto_reclamado_soles: d.monto_reclamado,
              fecha_registro: d.fecha_registro,
              descripcion_del_hecho: d.descripcion,
              peticion_del_consumidor: d.peticion,
            }),
          },
        ],
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const texto: string | undefined = json?.choices?.[0]?.message?.content;
    return texto?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Genera un BORRADOR de respuesta para una solicitud del Libro de
 * Reclamaciones. Usa IA si OPENAI_API_KEY está configurada; si no,
 * compone una carta con plantilla inteligente según los datos.
 * El borrador NUNCA se envía solo: queda en el editor esperando
 * la aprobación del administrador.
 */
export async function generarBorradorAction(
  input: BorradorInput
): Promise<BorradorResult> {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  // Validar que la solicitud exista realmente
  const supabase = createAdminClient();
  const { data: existe } = await supabase
    .from("libro_reclamaciones")
    .select("id")
    .eq("id", input.id)
    .maybeSingle();

  if (!existe) {
    return { success: false, message: "La solicitud no existe." };
  }

  const ia = await generarConIA(input);
  if (ia) {
    return { success: true, borrador: ia, modo: "ia" };
  }

  return { success: true, borrador: componerPlantilla(input), modo: "plantilla" };
}
