import { z } from "zod";

export const libroReclamacionesSchema = z.object({
  tipo: z.enum(["reclamo", "queja"], {
    message: "Selecciona el tipo de solicitud.",
  }),

  nombres: z.string().min(3, "Ingresa tus nombres."),

  apellidos: z.string().min(3, "Ingresa tus apellidos."),

  tipo_documento: z.enum(["dni", "ce", "pasaporte", "ruc"], {
    message: "Selecciona el tipo de documento.",
  }),

  numero_documento: z
    .string()
    .regex(/^[A-Za-z0-9]{7,15}$/, "Número de documento inválido."),

  direccion: z.string().min(5, "La dirección es obligatoria."),

  email: z.string().email("Correo electrónico inválido."),

  telefono: z.string().min(6, "Ingresa un teléfono válido."),

  producto_servicio: z
    .string()
    .min(3, "Indica el producto o servicio contratado."),

  monto_reclamado: z.coerce
    .number({ message: "Monto inválido." })
    .min(0, "El monto no puede ser negativo."),

  fecha_compra: z.string().optional(),

  descripcion: z
    .string()
    .min(20, "Describe los hechos con al menos 20 caracteres."),

  peticion: z.string().min(5, "Indica tu petición concreta."),
});

export type LibroReclamacionesSchema = z.infer<
  typeof libroReclamacionesSchema
>;
