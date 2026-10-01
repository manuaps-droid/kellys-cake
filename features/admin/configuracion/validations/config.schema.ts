import { z } from "zod";

// -------------------------------------------------------------
// Tienda
// -------------------------------------------------------------
export const tiendaSchema = z.object({
  nombre: z.string().min(1, "Ingrese el nombre de la tienda."),
  tagline: z.string(),
  descripcion: z.string(),
  moneda: z.enum(["PEN", "USD", "EUR"]).default("PEN"),
  simbolo: z.string().default("S/"),
  zona_cobertura: z.string(),
  logo_url: z.string().nullable(),
});

export type TiendaConfig = z.infer<typeof tiendaSchema>;

// -------------------------------------------------------------
// Contacto y redes sociales
// -------------------------------------------------------------
export const contactoSchema = z.object({
  telefono: z.string(),
  whatsapp: z.string(),
  email: z.string().email("Email inválido.").or(z.literal("")),
  direccion: z.string(),
  maps_url: z.string(),
  horario_lunes_viernes: z.string(),
  horario_sabado: z.string(),
  horario_domingo: z.string(),
  instagram: z.string(),
  facebook: z.string(),
  tiktok: z.string(),
  youtube: z.string(),
  whatsapp_activo: z.boolean(),
  whatsapp_mensaje: z.string(),
});

export type ContactoConfig = z.infer<typeof contactoSchema>;

// -------------------------------------------------------------
// Marketing & conversión
// -------------------------------------------------------------
export const marketingSchema = z.object({
  // Banners y promociones base
  banner_activo: z.boolean().default(false),
  banner_titulo: z.string().default(""),
  banner_texto: z.string().default(""),
  banner_color: z.string().default("#C8956C"),
  banner_link: z.string().default(""),
  envio_gratis_umbral: z.coerce.number().nullable().default(null),
  mostrar_testimonios: z.boolean().default(true),
  carrito_abandonado_minutos: z.coerce.number().nullable().default(60),
  carrito_abandonado_mensaje: z.string().default(""),

  // 1. Fidelización & Rewards (Kelly's Rewards)
  rewards_activo: z.boolean().default(true),
  niveles_activo: z.boolean().default(true),
  ruleta_activo: z.boolean().default(true),
  fechas_especiales_activo: z.boolean().default(true),
  streak_rewards_activo: z.boolean().default(true),
  rasca_gana_activo: z.boolean().default(false),

  // 2. Viral Loops & Referidos
  referidos_activo: z.boolean().default(true),
  cadena_regalos_activo: z.boolean().default(false),
  quiz_torta_ideal_activo: z.boolean().default(false),
  ediciones_limitadas_activo: z.boolean().default(false),
  leaderboard_embajadoras_activo: z.boolean().default(false),

  // 3. Conversión & Social Proof (Growth Hacking)
  social_proof_activo: z.boolean().default(true),
  exit_intent_activo: z.boolean().default(true),
  popup_registro_activo: z.boolean().default(true),
  precio_ancla_activo: z.boolean().default(true),
  whatsapp_express_activo: z.boolean().default(true),

  // 4. Monetización & Aumento de Ticket (Upsells & Bundles)
  upsells_carrito_activo: z.boolean().default(true),
  bundles_activo: z.boolean().default(true),
  suscripciones_activo: z.boolean().default(false),
  calculadora_porciones_activo: z.boolean().default(false),

  // 5. Email Marketing & Automatizaciones
  email_bienvenida_activo: z.boolean().default(true),
  email_carrito_abandonado_activo: z.boolean().default(true),
  email_post_compra_activo: z.boolean().default(true),
  email_cumpleanos_activo: z.boolean().default(true),

  // 6. SEO & Contenido
  blog_activo: z.boolean().default(true),
  seo_programatico_activo: z.boolean().default(false),
  resenas_producto_activo: z.boolean().default(true),
});

export type MarketingConfig = z.infer<typeof marketingSchema>;

// -------------------------------------------------------------
// SEO & Analytics
// -------------------------------------------------------------
export const seoSchema = z.object({
  title: z.string().max(70, "El título SEO no debería superar 70 caracteres."),
  description: z.string().max(180, "La descripción SEO no debería superar 180 caracteres."),
  keywords: z.string(),
  og_image_url: z.string().nullable(),
  google_site_verification: z.string().nullable(),
});

export type SeoConfig = z.infer<typeof seoSchema>;

// -------------------------------------------------------------
// Píxeles & remarketing
// -------------------------------------------------------------
export const pixelesSchema = z.object({
  ga4_id: z.string().nullable(),
  gtm_id: z.string().nullable(),
  meta_pixel_id: z.string().nullable(),
  tiktok_pixel_id: z.string().nullable(),
  google_ads_id: z.string().nullable(),
  conversao_google_ads_id: z.string().nullable(),
});

export type PixelesConfig = z.infer<typeof pixelesSchema>;

// -------------------------------------------------------------
// Notificaciones automáticas
// -------------------------------------------------------------
export const notificacionesSchema = z.object({
  notificar_pedido_email_admin: z.boolean(),
  email_admin: z.string().email("Email inválido.").or(z.literal("")),
  notificar_pedido_whatsapp_admin: z.boolean(),
  whatsapp_admin: z.string(),
  confirmacion_cliente_asunto: z.string(),
  confirmacion_cliente_cuerpo: z.string(),
  recordatorio_cliente_asunto: z.string(),
  recordatorio_cliente_cuerpo: z.string(),
});

export type NotificacionesConfig = z.infer<typeof notificacionesSchema>;

// -------------------------------------------------------------
// Registro de toda sección
// -------------------------------------------------------------
export const SECCION_SCHEMA = {
  tienda: tiendaSchema,
  contacto: contactoSchema,
  marketing: marketingSchema,
  seo: seoSchema,
  pixeles: pixelesSchema,
  notificaciones: notificacionesSchema,
} as const;

export type SeccionConfig = keyof typeof SECCION_SCHEMA;

export const SECCIONES: SeccionConfig[] = [
  "tienda",
  "contacto",
  "marketing",
  "seo",
  "pixeles",
  "notificaciones",
];
