import { createClient } from "@/lib/supabase/server";

export async function getCartCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!cliente) {
    return 0;
  }

  const { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    return 0;
  }

  const { data: items, error } = await supabase
    .from("carrito_items")
    .select("cantidad")
    .eq("carrito_id", carrito.id);

  if (error || !items) {
    return 0;
  }

  return items.reduce((total, item) => total + item.cantidad, 0);
}