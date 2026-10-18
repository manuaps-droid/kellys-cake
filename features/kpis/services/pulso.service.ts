import { createAdminClient } from "@/lib/supabase/admin";

import type {
  DatosPulso,
  EstadoMerma,
  EstadoRotacion,
  FilaRotacion,
} from "../types/pulso.types";

function ahoraLima(): Date {
  return new Date(Date.now() - 5 * 60 * 60 * 1000);
}

function claveMes(fecha: Date): string {
  return fecha.toISOString().slice(0, 7);
}

function mesAnterior(clave: string): string {
  const [anio, mes] = clave.split("-").map(Number);
  const d = new Date(Date.UTC(anio, mes - 2, 1));
  return d.toISOString().slice(0, 7);
}

function clasificarRotacion(
  unidadesSemana: number
): EstadoRotacion {
  if (unidadesSemana >= 2) return "alta";
  if (unidadesSemana >= 1) return "media";
  return "baja";
}

function clasificarMerma(pct: number): EstadoMerma {
  if (pct <= 5) return "saludable";
  if (pct <= 10) return "alerta";
  return "critico";
}

/**
 * Pulso del Negocio: calcula los indicadores de gestión con
 * datos reales (pedidos, clientes, items vendidos) en lenguaje
 * natural para decisiones inmediatas.
 */
export async function getPulsoNegocio(): Promise<DatosPulso> {
  const supabase = createAdminClient();

  const lima = ahoraLima();
  const mesActual = claveMes(lima);
  const mesPrevio = mesAnterior(mesActual);
  const hace30Dias = new Date(lima);
  hace30Dias.setUTCDate(hace30Dias.getUTCDate() - 30);

  const vacio: DatosPulso = {
    tieneDatos: false,
    ticket: {
      actual: 0,
      anterior: null,
      diferencia: 0,
      pedidosMes: 0,
      totalMes: 0,
    },
    lealtad: {
      pct: 0,
      recurrentes: 0,
      nuevos: 0,
      totalMes: 0,
      clientesNuevos: 0,
    },
    merma: {
      registrada: false,
      monto: 0,
      pct: 0,
      estado: "sin-registro",
    },
    rotacion: [],
  };

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, cliente_id, total, created_at")
    .neq("estado", "cancelado")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[pulso] Error leyendo pedidos:", error.message);
    return vacio;
  }

  if (!pedidos || pedidos.length === 0) {
    // Sin pedidos: aún puede haber merma registrada
    const merma = await leerMermaRegistrada(supabase, mesActual, 0);
    return { ...vacio, merma, tieneDatos: false };
  }

  type PedidoRow = {
    id: string;
    cliente_id: string | null;
    total: number | null;
    created_at: string;
  };

  const filas = pedidos as PedidoRow[];

  // Primer mes de compra de cada cliente
  const primerMesPorCliente = new Map<string, string>();

  for (const p of filas) {
    if (!p.cliente_id) continue;
    const clave = p.created_at.slice(0, 7);
    const previo = primerMesPorCliente.get(p.cliente_id);
    if (!previo || clave < previo) {
      primerMesPorCliente.set(p.cliente_id, clave);
    }
  }

  const delMes = filas.filter(
    (p) => p.created_at.slice(0, 7) === mesActual
  );
  const delMesPrevio = filas.filter(
    (p) => p.created_at.slice(0, 7) === mesPrevio
  );

  const totalMes = delMes.reduce(
    (t, p) => t + Number(p.total ?? 0),
    0
  );
  const totalPrevio = delMesPrevio.reduce(
    (t, p) => t + Number(p.total ?? 0),
    0
  );

  const ticketActual =
    delMes.length > 0 ? totalMes / delMes.length : 0;
  const ticketPrevio =
    delMesPrevio.length > 0 ? totalPrevio / delMesPrevio.length : null;

  // Lealtad: pedidos de este mes de clientes que ya compraron antes
  let recurrentes = 0;
  const clientesUnicosMes = new Set<string>();

  for (const p of delMes) {
    if (!p.cliente_id) continue;
    clientesUnicosMes.add(p.cliente_id);

    const primerMes = primerMesPorCliente.get(p.cliente_id);
    if (primerMes && primerMes < mesActual) {
      recurrentes += 1;
    }
  }

  const pedidosMesConCliente = delMes.filter((p) => p.cliente_id).length;
  const nuevos = pedidosMesConCliente - recurrentes;

  const clientesNuevos = [...primerMesPorCliente.entries()].filter(
    ([, primer]) => primer === mesActual
  ).length;

  // Rotación: unidades vendidas por producto en los últimos 30 días
  const idsRecientes = filas
    .filter((p) => new Date(p.created_at) >= hace30Dias)
    .map((p) => p.id);

  let rotacion: FilaRotacion[] = [];

  if (idsRecientes.length > 0) {
    const { data: items } = await supabase
      .from("pedido_items")
      .select("cantidad, productos (nombre)")
      .in("pedido_id", idsRecientes.slice(0, 2000));

    const conteo = new Map<string, number>();

    for (const item of (items ?? []) as Array<{
      cantidad: number | null;
      productos: { nombre: string | null } | Array<{
        nombre: string | null;
      }> | null;
    }>) {
      const producto = Array.isArray(item.productos)
        ? item.productos[0]
        : item.productos;
      const nombre = producto?.nombre?.trim();

      if (!nombre) continue;

      const previo = conteo.get(nombre) ?? 0;
      conteo.set(nombre, previo + Number(item.cantidad ?? 0));
    }

    rotacion = [...conteo.entries()]
      .map(([nombre, unidades]) => {
        const unidadesSemana =
          Math.round((unidades / 30) * 7 * 10) / 10;
        const porDia = unidades / 30;
        const horasPorUnidad =
          porDia > 0 ? Math.round(24 / porDia) : null;

        return {
          nombre,
          unidadesSemana,
          horasPorUnidad,
          estado: clasificarRotacion(unidadesSemana),
        };
      })
      .sort((a, b) => b.unidadesSemana - a.unidadesSemana)
      .slice(0, 6);
  }

  const merma = await leerMermaRegistrada(supabase, mesActual, totalMes);

  return {
    tieneDatos: true,
    ticket: {
      actual: Math.round(ticketActual * 100) / 100,
      anterior:
        ticketPrevio != null
          ? Math.round(ticketPrevio * 100) / 100
          : null,
      diferencia:
        ticketPrevio != null
          ? Math.round((ticketActual - ticketPrevio) * 100) / 100
          : 0,
      pedidosMes: delMes.length,
      totalMes: Math.round(totalMes * 100) / 100,
    },
    lealtad: {
      pct:
        pedidosMesConCliente > 0
          ? Math.round((recurrentes / pedidosMesConCliente) * 100)
          : 0,
      recurrentes,
      nuevos,
      totalMes: pedidosMesConCliente,
      clientesNuevos,
    },
    merma,
    rotacion,
  };
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

async function leerMermaRegistrada(
  supabase: SupabaseAdmin,
  mesActual: string,
  ventasMes: number
): Promise<DatosPulso["merma"]> {
  const { data: row } = await supabase
    .from("tienda_config")
    .select("seccion, data")
    .eq("seccion", "foodos_merma")
    .maybeSingle();

  const registro = row?.data as
    | { mes?: string; monto?: number }
    | null
    | undefined;

  if (
    !registro ||
    registro.mes !== mesActual ||
    !Number.isFinite(Number(registro.monto))
  ) {
    return {
      registrada: false,
      monto: 0,
      pct: 0,
      estado: "sin-registro",
    };
  }

  const monto = Math.abs(Number(registro.monto));
  const pct =
    ventasMes > 0
      ? Math.round((monto / ventasMes) * 1000) / 10
      : 0;

  return {
    registrada: true,
    monto: Math.round(monto * 100) / 100,
    pct,
    estado: clasificarMerma(pct),
  };
}
