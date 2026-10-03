import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "../types/product.type";

export async function getProductById(
  id: string
): Promise<Product | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error en getProductById:", error);
    return null;
  }

  return data as Product;
}