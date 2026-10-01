import { z } from "zod";

export const compraItemSchema = z.object({
  ingrediente_id: z.string().uuid("Selecciona un ingrediente"),
  cantidad: z.coerce.number().min(0.0001, "Cantidad debe ser mayor a 0"),
  precio_total: z.coerce.number().min(0.01, "Precio debe ser mayor a 0"),
});

export const compraSchema = z.object({
  proveedor_id: z.string().optional(),
  fecha: z.string().min(1, "Fecha obligatoria"),
  numero_factura: z.string().optional(),
  items: z.array(compraItemSchema).min(1, "Añade al menos un item a la compra"),
});

export type CompraFormValues = z.infer<typeof compraSchema>;
