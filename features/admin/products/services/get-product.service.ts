import { createClient } from "@/lib/supabase/server";

import type { Product } from "../types/product.type";

export async function getProductById(
  id: string
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Product;
}