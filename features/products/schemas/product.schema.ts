import { z } from "zod";

export const productSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre es demasiado largo"),

  slug: z
    .string()
    .trim()
    .min(3, "El slug es obligatorio")
    .max(150),

  descripcion: z.string().optional(),

  descripcion_corta: z.string().optional(),

  precio: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),

  categoria: z.string().optional(),

  imagen_principal_id: z.string().uuid().nullable().optional(),

  disponible: z.boolean(),

  destacado: z.boolean(),

  estado: z.enum(["borrador", "publicado"]),

  seo_title: z
    .string()
    .max(70, "Máximo 70 caracteres")
    .optional(),

  seo_description: z
    .string()
    .max(160, "Máximo 160 caracteres")
    .optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;