import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
}

export async function getEventos() {
  const supabase = await getSupabaseClient();
  const { data: eventos, error } = await supabase
    .from("foodos_eventos")
    .select("*, gastos:foodos_evento_gastos(monto, es_tercerizado)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error obteniendo eventos:", error);
    return [];
  }

  return (eventos || []).map((ev: any) => {
    const gastos = ev.gastos || [];
    const totalGastos = gastos.reduce((s: number, g: any) => s + Number(g.monto || 0), 0);
    const gastosTercerizados = gastos.filter((g: any) => g.es_tercerizado).reduce((s: number, g: any) => s + Number(g.monto || 0), 0);
    const ganancia = Number(ev.monto_cobrado || 0) - totalGastos;
    const margen = ev.monto_cobrado > 0 ? (ganancia / ev.monto_cobrado) * 100 : 0;

    return {
      ...ev,
      total_gastos: totalGastos,
      gastos_tercerizados: gastosTercerizados,
      gastos_propios: totalGastos - gastosTercerizados,
      ganancia,
      margen,
      num_gastos: gastos.length
    };
  });
}
