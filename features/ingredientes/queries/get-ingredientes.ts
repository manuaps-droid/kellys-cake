import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function getIngredientes() {
  const supabase = await getSupabaseClient();
  
  // RLS (Row Level Security) asegura que esto solo retorne 
  // los ingredientes del tenant del usuario actual automáticamente
  const { data, error } = await supabase
    .from('ingredientes')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error("💥 ERROR SUPABASE EXACTO:", String(error), " | Nombre:", error?.name, " | Mensaje:", error?.message, " | Stack:", error?.stack);
    return [];
  }
  
  return data || [];
}



