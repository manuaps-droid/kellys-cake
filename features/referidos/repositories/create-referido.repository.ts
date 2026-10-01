import { createAdminClient } from "@/lib/supabase/admin";

export async function createReferralCode(clienteId: string, codigo: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('referidos')
    .insert({
      referente_id: clienteId,
      codigo: codigo,
      estado: 'pendiente'
    });

  if (error) {
    console.error("Error creating referral code:", error);
    return false;
  }
  return true;
}

export async function applyReferralCode(codigo: string, referidoId: string): Promise<boolean> {
  const supabase = createAdminClient();
  
  // Buscar el referido por código y que esté pendiente
  const { data: refData, error: refError } = await supabase
    .from('referidos')
    .select('id, referente_id')
    .eq('codigo', codigo)
    .eq('estado', 'pendiente')
    .is('referido_id', null)
    .single();

  if (refError || !refData) {
    console.error("Error finding valid referral code:", refError);
    return false;
  }

  // No permitir auto-referencia
  if (refData.referente_id === referidoId) {
    return false;
  }

  const { error: updateError } = await supabase
    .from('referidos')
    .update({
      referido_id: referidoId,
      estado: 'registrado'
    })
    .eq('id', refData.id);

  if (updateError) {
    console.error("Error applying referral code:", updateError);
    return false;
  }
  return true;
}
