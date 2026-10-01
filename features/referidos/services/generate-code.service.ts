import { createAdminClient } from "@/lib/supabase/admin";

export async function generateReferralCode(): Promise<string> {
  const supabase = createAdminClient();
  let unique = false;
  let code = '';
  
  while (!unique) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    code = `KELLY-${randomPart}`;
    
    const { data, error } = await supabase
      .from('referidos')
      .select('id')
      .eq('codigo', code)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // PGRST116 means zero rows returned, so the code is unique
      unique = true;
    }
  }
  
  return code;
}
