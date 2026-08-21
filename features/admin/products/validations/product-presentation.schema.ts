import { z } from "zod";

export const productPresentationSchema = z.object({
  producto_id: z.string().uuid(),

  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150),

  descripcion: z.string().optional(),

  precio: z
    .number()
    .min(0, "Ingrese un precio válido."),

  precio_oferta: z
    .number()
    .nullable()
    .optional(),

  sku: z.string().optional(),

  codigo_barras: z.string().optional(),

  stock: z
    .number()
    .nullable()
    .optional(),

  peso: z
    .number()
    .nullable()
    .optional(),

  tiempo_preparacion: z
    .number()
    .nullable()
    .optional(),

  imagen_id: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  slug: z.string().optional(),

  predeterminada: z.boolean().optional(),

  orden: z.number(),
});

export type ProductPresentationSchema = z.infer<
  typeof productPresentationSchema
>;