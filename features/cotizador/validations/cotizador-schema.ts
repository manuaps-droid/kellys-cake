import { z } from "zod";

export const cotizacionItemSchema = z.object({
  tipo_item: z.enum(["producto", "extra"]),
  producto_id: z.string().optional(),
  nombre_descripcion: z.string().min(1, "Descripción requerida"),
  cantidad: z.coerce.number().min(0.5, "Mínimo 0.5"),
  costo_unitario: z.coerce.number().min(0, "Costo no válido"),
  precio_venta_unitario: z.coerce.number().min(0, "Precio de venta no válido"),
});

export const cotizacionSchema = z.object({
  cliente_nombre: z.string().min(1, "Nombre de cliente requerido"),
  fecha_evento: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(cotizacionItemSchema).min(1, "Añade al menos un item a la cotización"),
});

export type CotizacionFormValues = z.infer<typeof cotizacionSchema>;
