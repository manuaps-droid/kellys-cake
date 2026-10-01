import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  categoria_id: z.string().optional(),
  precio_venta: z.coerce.number().min(0, "El precio no puede ser negativo").default(0),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;
