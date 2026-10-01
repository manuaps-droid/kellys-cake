import { createClient } from "@/lib/supabase/server";
import { RewardsTransaccion } from "../types/rewards.types";

export async function getHistoryRepository(
  clienteId: string,
  page: number = 1,
  perPage: number = 10
): Promise<{ transacciones: RewardsTransaccion[]; total: number }> {
  const supabase = await createClient();
  const start = (page - 1) * perPage;
  const end = start + perPage - 1;

  const { data, error, count } = await supabase
    .from('rewards_transacciones')
    .select('*', { count: 'exact' })
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching rewards history:', error);
    return { transacciones: [], total: 0 };
  }

  return {
    transacciones: data as RewardsTransaccion[],
    total: count || 0
  };
}
