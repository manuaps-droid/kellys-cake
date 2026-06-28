import { supabase } from "@/lib/supabase";
import { RegisterData } from "@/types/auth";

export async function registerUser(data: RegisterData) {
  console.log("Registro:", data);

  // Aquí implementaremos el registro con Supabase
}