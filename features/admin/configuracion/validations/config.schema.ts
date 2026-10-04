import { z } from "zod";

// -------------------------------------------------------------
// Tienda
// -------------------------------------------------------------
export const tiendaSchema = z.object({
  nombre: z.string().min(1, "Ingrese el nombre de la tienda.").default("Kelly's Cake"),
  tagline: z.string().default(""),
  descripcion: z.string().default(""),
  moneda: z.enum(["PEN", "USD", "EUR"]).default("PEN"),
  simbolo: z.string().default("S/"),
  zona_cobertura: z.string().default(""),
  logo_url: z.string().nullish().default(null),
});

export type TiendaConfig = z.infer<typeof tiendaSchema>;

// -------------------------------------------------------------
// Contacto y redes sociales
// -------------------------------------------------------------
export const contactoSchema = z.object({
  telefono: z.string().default(""),
  whatsapp: z.string().default(""),
  email: z.string().email("Email inválido.").or(z.literal("")).default(""),
  direccion: z.string().default(""),
  maps_url: z.string().default(""),
  horario_lunes_viernes: z.string().default(""),
  horario_sabado: z.string().default(""),
  horario_domingo: z.string().default(""),
  instagram: z.string().default(""),
  facebook: z.string().default(""),
  tiktok: z.string().default(""),
  youtube: z.string().default(""),
  whatsapp_activo: z.coerce.boolean().default(false),
  whatsapp_mensaje: z.string().default(""),
});

export type ContactoConfig = z.infer<typeof contactoSchema>;

// -------------------------------------------------------------
// Marketing & conversión
// -------------------------------------------------------------
export const marketingSchema = z.object({
  // Banners y promociones base
  banner_activo: z.coerce.boolean().default(false),
  banner_titulo: z.string().default(""),
  banner_texto: z.string().default(""),
  banner_color: z.string().default("#C8956C"),
  banner_link: z.string().default(""),
  envio_gratis_umbral: z.coerce.number().nullable().default(null),
  mostrar_testimonios: z.coerce.boolean().default(true),
  carrito_abandonado_minutos: z.coerce.number().nullable().default(60),
  carrito_abandonado_mensaje: z.string().default(""),

  // 1. Fidelización & Rewards (Kelly's Rewards)
  rewards_activo: z.coerce.boolean().default(true),
  niveles_activo: z.coerce.boolean().default(true),
  ruleta_activo: z.coerce.boolean().default(true),
  fechas_especiales_activo: z.coerce.boolean().default(true),
  streak_rewards_activo: z.coerce.boolean().default(true),
  rasca_gana_activo: z.coerce.boolean().default(false),

  // 2. Viral Loops & Referidos
  referidos_activo: z.coerce.boolean().default(true),
  cadena_regalos_activo: z.coerce.boolean().default(false),
  quiz_torta_ideal_activo: z.coerce.boolean().default(false),
  ediciones_limitadas_activo: z.coerce.boolean().default(false),
  leaderboard_embajadoras_activo: z.coerce.boolean().default(false),

  // 3. Conversión & Social Proof (Growth Hacking)
  social_proof_activo: z.coerce.boolean().default(true),
  exit_intent_activo: z.coerce.boolean().default(true),
  popup_registro_activo: z.coerce.boolean().default(true),
  precio_ancla_activo: z.coerce.boolean().default(true),
  whatsapp_express_activo: z.coerce.boolean().default(true),

  // 4. Monetización & Aumento de Ticket (Upsells & Bundles)
  upsells_carrito_activo: z.coerce.boolean().default(true),
  bundles_activo: z.coerce.boolean().default(true),
  suscripciones_activo: z.coerce.boolean().default(false),
  calculadora_porciones_activo: z.coerce.boolean().default(false),

  // 5. Email Marketing & Automatizaciones
  email_bienvenida_activo: z.coerce.boolean().default(true),
  email_carrito_abandonado_activo: z.coerce.boolean().default(true),
  email_post_compra_activo: z.coerce.boolean().default(true),
  email_cumpleanos_activo: z.coerce.boolean().default(true),

  // 6. SEO & Contenido
  blog_activo: z.coerce.boolean().default(true),
  seo_programatico_activo: z.coerce.boolean().default(false),
  resenas_producto_activo: z.coerce.boolean().default(true),
});

export type MarketingConfig = z.infer<typeof marketingSchema>;

// -------------------------------------------------------------
// Productos & Stock de Insumos Especiales (Papel Azúcar y Arroz)
// -------------------------------------------------------------
export const productosSchema = z.object({
  papel_azucar_activo: z.coerce.boolean().default(true),
  papel_arroz_activo: z.coerce.boolean().default(true),
  papel_azucar_aviso: z.string().default("Papel de Azúcar temporalmente sin stock."),
  papel_arroz_aviso: z.string().default("Papel de Arroz temporalmente sin stock."),
});

export type ProductosConfig = z.infer<typeof productosSchema>;

// -------------------------------------------------------------
// SEO & Analytics
// -------------------------------------------------------------
export const seoSchema = z.object({
  title: z.string().max(70, "El título SEO no debería superar 70 caracteres.").default(""),
  description: z.string().max(180, "La descripción SEO no debería superar 180 caracteres.").default(""),
  keywords: z.string().default(""),
  og_image_url: z.string().nullish().default(null),
  google_site_verification: z.string().nullish().default(null),
});

export type SeoConfig = z.infer<typeof seoSchema>;

// -------------------------------------------------------------
// Píxeles & remarketing
// -------------------------------------------------------------
export const pixelesSchema = z.object({
  ga4_id: z.string().nullish().default(null),
  gtm_id: z.string().nullish().default(null),
  meta_pixel_id: z.string().nullish().default(null),
  tiktok_pixel_id: z.string().nullish().default(null),
  google_ads_id: z.string().nullish().default(null),
  conversao_google_ads_id: z.string().nullish().default(null),
});

export type PixelesConfig = z.infer<typeof pixelesSchema>;

// -------------------------------------------------------------
// Notificaciones automáticas
// -------------------------------------------------------------
export const notificacionesSchema = z.object({
  notificar_pedido_email_admin: z.coerce.boolean().default(false),
  email_admin: z.string().email("Email inválido.").or(z.literal("")).default(""),
  notificar_pedido_whatsapp_admin: z.coerce.boolean().default(false),
  whatsapp_admin: z.string().default(""),
  confirmacion_cliente_asunto: z.string().default(""),
  confirmacion_cliente_cuerpo: z.string().default(""),
  recordatorio_cliente_asunto: z.string().default(""),
  recordatorio_cliente_cuerpo: z.string().default(""),
});

export type NotificacionesConfig = z.infer<typeof notificacionesSchema>;

// -------------------------------------------------------------
// Registro de toda sección
// -------------------------------------------------------------
export const SECCION_SCHEMA = {
  tienda: tiendaSchema,
  contacto: contactoSchema,
  marketing: marketingSchema,
  productos: productosSchema,
  seo: seoSchema,
  pixeles: pixelesSchema,
  notificaciones: notificacionesSchema,
} as const;

export type SeccionConfig = keyof typeof SECCION_SCHEMA;

export const SECCIONES: SeccionConfig[] = [
  "tienda",
  "contacto",
  "marketing",
  "productos",
  "seo",
  "pixeles",
  "notificaciones",
];
