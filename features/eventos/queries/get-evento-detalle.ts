import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
}

export async function getEventoDetalle(eventoId: string) {
  const supabase = await getSupabaseClient();

  const { data: evento, error } = await supabase
    .from("foodos_eventos")
    .select("*")
    .eq("id", eventoId)
    .single();

  if (error || !evento) return null;

  const { data: gastos } = await supabase
    .from("foodos_evento_gastos")
    .select("*")
    .eq("evento_id", eventoId)
    .order("created_at", { ascending: true });

  const listaGastos = gastos || [];
  const totalGastos = listaGastos.reduce((s, g: any) => s + Number(g.monto || 0), 0);
  const gastosTercerizados = listaGastos.filter((g: any) => g.es_tercerizado).reduce((s, g: any) => s + Number(g.monto || 0), 0);
  const ganancia = Number(evento.monto_cobrado || 0) - totalGastos;
  const margen = evento.monto_cobrado > 0 ? (ganancia / evento.monto_cobrado) * 100 : 0;

  // Agrupar gastos por categoría
  const porCategoria: Record<string, number> = {};
  for (const g of listaGastos) {
    const cat = (g as any).categoria || "general";
    porCategoria[cat] = (porCategoria[cat] || 0) + Number((g as any).monto || 0);
  }

  return {
    ...evento,
    gastos: listaGastos,
    total_gastos: totalGastos,
    gastos_tercerizados: gastosTercerizados,
    gastos_propios: totalGastos - gastosTercerizados,
    ganancia,
    margen,
    gastos_por_categoria: porCategoria
  };
}
