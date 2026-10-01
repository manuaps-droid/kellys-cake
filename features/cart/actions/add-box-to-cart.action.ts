"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/features/auth/services/auth.server";

type ComposicionItem = {
  productoId: string;
  cantidad: number;
};

type BoxInput = {
  productoId: string;
  nombre: string;
  descripcion: string;
  composicion: ComposicionItem[];
};

type PresSabor = { unidades: number; precio: number };

// Precio de un sabor para `q` unidades según sus presentaciones:
// coincidencia exacta, o prorrateo con la presentación de referencia.
function precioSabor(presentaciones: PresSabor[], q: number): number {
  if (presentaciones.length === 0) return 0;
  const exacta = presentaciones.find((p) => p.unidades === q);
  if (exacta) return exacta.precio;
  const mayor = presentaciones
    .filter((p) => p.unidades > q)
    .sort((a, b) => a.unidades - b.unidades)[0];
  const ref = mayor ?? presentaciones[0];
  return (ref.precio / ref.unidades) * q;
}

/**
 * Agrega una caja personalizada al carrito como LÍNEA PROPIA
 * (las cajas nunca se fusionan entre sí, para preservar su
 * composición). El precio se calcula en el servidor sumando el
 * precio de la presentación de cada sabor para su cantidad.
 */
export async function addBoxToCartAction(input: BoxInput) {
  const { supabase, cliente } = await getCurrentClient();

  if (
    !input.composicion ||
    input.composicion.length === 0
  ) {
    return {
      success: false,
      message: "La caja debe tener al menos un sabor.",
    };
  }

  const totalUnidades = input.composicion.reduce(
    (s, c) => s + c.cantidad,
    0
  );
  if (totalUnidades < 18) {
    return {
      success: false,
      message: "La caja debe tener un mínimo de 18 unidades.",
    };
  }

  const productIds = [
    ...new Set(input.composicion.map((c) => c.productoId)),
  ];

  // Presentaciones reales de los sabores (precios del servidor, nunca del cliente)
  const { data: presData } = await supabase
    .from("producto_presentaciones")
    .select("producto_id, nombre, precio, activo")
    .in("producto_id", productIds);

  const presentacionesByProduct: Record<string, PresSabor[]> = {};

  for (const p of presData ?? []) {
    if (p.activo === false) continue;
    const pid = p.producto_id as string;
    const unidades = parseInt((p.nombre as string).match(/\d+/)?.[0] ?? "", 10);
    if (Number.isNaN(unidades) || unidades <= 0) continue;
    (presentacionesByProduct[pid] ??= []).push({
      unidades,
      precio: Number(p.precio),
    });
  }

  for (const pres of Object.values(presentacionesByProduct)) {
    pres.sort((a, b) => a.unidades - b.unidades);
  }

  const total = input.composicion.reduce((acc, c) => {
    const pres = presentacionesByProduct[c.productoId] ?? [];
    return acc + precioSabor(pres, c.cantidad);
  }, 0);

  if (total <= 0) {
    return {
      success: false,
      message: "No se pudo calcular el precio de la caja.",
    };
  }

  // Obtener o crear carrito
  let { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    const { data: nuevoCarrito, error } = await supabase
      .from("carrito")
      .insert({ cliente_id: cliente.id })
      .select("id")
      .single();

    if (error || !nuevoCarrito) {
      return {
        success: false,
        message: error?.message ?? "No se pudo crear el carrito.",
      };
    }

    carrito = nuevoCarrito;
  }

  if (!carrito) {
    return { success: false, message: "Carrito no disponible." };
  }

  // Siempre insertar una nueva línea (cada caja es única)
  const { error } = await supabase.from("carrito_items").insert({
    carrito_id: carrito.id,
    producto_id: input.productoId,
    cantidad: 1,
    precio_unitario: Math.round(total * 100) / 100,
    nombre: input.nombre,
    descripcion: input.descripcion,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/carrito");

  return { success: true };
}