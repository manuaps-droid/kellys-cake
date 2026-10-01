"use server";

import { z } from "zod";

const productSchema = z.object({
  id: z.string(),
  nombre: z.string().min(3).max(120),
  descripcion: z.string().optional(),
  catalogo: z.string(),
  precio: z.number().min(0),
  imagen_principal_id: z.string(),
  estado: z.enum(["borrador", "publicado"]),
});

export type CreateProductInput = z.infer<typeof productSchema>;

export async function createProductAction(data: CreateProductInput) {
  // Simulación: en producción esto iría a Supabase
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    id: data.id,
    message: "Producto creado exitosamente",
  };
}