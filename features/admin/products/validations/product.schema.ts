import { z } from "zod";

export const productSchema = z.object({
  nombre: z
    .string()
    .min(
      3,
      "El nombre debe tener al menos 3 caracteres."
    ),

  slug: z.string(),

  descripcion: z
    .string()
    .min(
      10,
      "La descripción debe tener al menos 10 caracteres."
    ),

  descripcion_corta: z.string(),

  categoria: z
    .string()
    .min(
      2,
      "Ingrese una categoría."
    ),

  catalogo_id: z
    .string()
    .uuid("Seleccione un catálogo."),

  precio: z
    .number()
    .nullable()
    .optional(),

  imagen: z.string(),

  imagen_principal_id: z
    .string()
    .nullable(),

  disponible: z.boolean(),

  destacado: z.boolean(),

  mas_vendido: z.boolean(),

  estado: z.enum([
    "borrador",
    "publicado",
  ]),

  seo_title: z.string(),

  seo_description: z.string(),
});

export type ProductSchema =
  z.infer<typeof productSchema>;