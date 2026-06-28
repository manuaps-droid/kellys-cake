import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function signUp(
  nombre: string,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
      },
    },
  });

  return { data, error };
}