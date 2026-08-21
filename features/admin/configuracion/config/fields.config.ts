import type { FieldDef } from "../components/ConfigSectionForm";

// -------------------------------------------------------------
// Tienda
// -------------------------------------------------------------
export const TIENDA_FIELDS: FieldDef[] = [
  {
    key: "nombre",
    type: "text",
    label: "Nombre de la tienda",
    help: "Se mostrará en el header, footer y emails.",
    half: true,
  },
  {
    key: "tagline",
    type: "text",
    label: "Tagline / slogan",
    placeholder: "Pasteles personalizados de alta costura",
    help: "Frase corta bajo el logo en la home.",
    half: true,
  },
  {
    key: "descripcion",
    type: "textarea",
    label: "Descripción de la tienda",
    help: "Usada para SEO e Instagram.",
  },
  {
    key: "moneda",
    type: "select",
    label: "Moneda",
    options: [
      { value: "PEN", label: "Soles (PEN)" },
      { value: "USD", label: "Dólares (USD)" },
      { value: "EUR", label: "Euros (EUR)" },
    ],
    half: true,
  },
  {
    key: "simbolo",
    type: "text",
    label: "Símbolo",
    placeholder: "S/",
    half: true,
  },
  {
    key: "zona_cobertura",
    type: "text",
    label: "Zona de cobertura",
    placeholder: "Arequipa metropolitana y alrededores",
    help: "Texto mostrado en checkout y páginas informativas.",
  },
  {
    key: "logo_url",
    type: "url",
    label: "Logo (URL)",
    help: "URL del logo. Recomendado: 200×56px, fondo transparente.",
  },
];

// -------------------------------------------------------------
// Contacto & Redes Sociales
// -------------------------------------------------------------
export const CONTACTO_FIELDS: FieldDef[] = [
  {
    key: "telefono",
    type: "text",
    label: "Teléfono fijo",
    placeholder: "+51 58 123 456",
    half: true,
  },
  {
    key: "email",
    type: "email",
    label: "Email",
    placeholder: "tienda@kellyscake.pe",
    half: true,
  },
  {
    key: "whatsapp",
    type: "text",
    label: "WhatsApp (número completo con país)",
    placeholder: "51987654321",
    help: "Sin +, sin espacios. Para el botón flotante.",
    half: true,
  },
  {
    key: "whatsapp_activo",
    type: "switch",
    label: "Mostrar botón flotante de WhatsApp",
    help: "Aparece abajo a la derecha en toda la tienda.",
  },
  {
    key: "whatsapp_mensaje",
    type: "textarea",
    label: "Mensaje predeterminado de WhatsApp",
  },
  {
    key: "direccion",
    type: "text",
    label: "Dirección",
    placeholder: "Av. Ejército 710, Arequipa",
  },
  {
    key: "maps_url",
    type: "url",
    label: "URL de Google Maps",
    help: "Embed o link de maps para la sección contacto.",
  },
  {
    key: "horario_lunes_viernes",
    type: "text",
    label: "Horario Lun a Vie",
    placeholder: "09:00 - 19:00",
    half: true,
  },
  {
    key: "horario_sabado",
    type: "text",
    label: "Horario Sábado",
    placeholder: "10:00 - 14:00",
    half: true,
  },
  {
    key: "horario_domingo",
    type: "text",
    label: "Horario Domingo",
    placeholder: "Cerrado",
    half: true,
  },
  {
    key: "instagram",
    type: "url",
    label: "Instagram",
    placeholder: "https://instagram.com/kellyscake",
    half: true,
  },
  {
    key: "facebook",
    type: "url",
    label: "Facebook",
    placeholder: "https://facebook.com/kellyscake",
    half: true,
  },
  {
    key: "tiktok",
    type: "url",
    label: "TikTok",
    placeholder: "https://tiktok.com/@kellyscake",
    half: true,
  },
  {
    key: "youtube",
    type: "url",
    label: "YouTube",
    placeholder: "https://youtube.com/@kellyscake",
    half: true,
  },
];

// -------------------------------------------------------------
// Marketing & conversión
// -------------------------------------------------------------
export const MARKETING_FIELDS: FieldDef[] = [
  {
    key: "banner_activo",
    type: "switch",
    label: "Activar banner promocional",
    help: "Se muestra en el top del header en toda la tienda.",
  },
  {
    key: "banner_titulo",
    type: "text",
    label: "Título del banner",
    placeholder: "Día de la Madre",
    half: true,
  },
  {
    key: "banner_color",
    type: "color",
    label: "Color de fondo del banner",
    half: true,
  },
  {
    key: "banner_texto",
    type: "text",
    label: "Texto / subtítulo",
    placeholder: "20% de descuento en todos los pedidos para el 10 de mayo.",
  },
  {
    key: "banner_link",
    type: "url",
    label: "Enlace del banner",
    placeholder: "/personalizar",
    help: "URL interna o externa.",
  },
  {
    key: "envio_gratis_umbral",
    type: "number",
    label: "Umbral para envío gratis (S/)",
    placeholder: "150",
    help: "Si el carrito supera este monto, se aplicará envío gratis. Dejar vacío para desactivar.",
    half: true,
  },
  {
    key: "mostrar_testimonios",
    type: "switch",
    label: "Mostrar testimonios en home",
  },
  {
    key: "carrito_abandonado_minutos",
    type: "number",
    label: "Tiempo (min) para considerar carrito abandonado",
    placeholder: "60",
    help: "Tiempo a partir del cual un carrito sin actividad se considera abandonado. Dejar vacío para desactivar.",
    half: true,
  },
  {
    key: "carrito_abandonado_mensaje",
    type: "textarea",
    label: "Mensaje de recordatorio de carrito abandonado",
  },
];

// -------------------------------------------------------------
// SEO & Analytics
// -------------------------------------------------------------
export const SEO_FIELDS: FieldDef[] = [
  {
    key: "title",
    type: "text",
    label: "Título SEO (title tag)",
    help: "Visible en la pestaña del navegador y resultados de Google. Máximo 70 caracteres.",
  },
  {
    key: "description",
    type: "textarea",
    label: "Meta descripción",
    help: "Visible en el snippet de Google. Máximo 180 caracteres.",
  },
  {
    key: "keywords",
    type: "text",
    label: "Keywords (separadas por coma)",
    placeholder: "tortas, pasteles, personalizados, bodas, Arequipa",
    help: "Las palabras clave ya no son un factor de ranking importante en Google, pero algunos buscadores y directorios las usan.",
  },
  {
    key: "og_image_url",
    type: "url",
    label: "Imagen Open Graph (preview de redes sociales)",
    help: "Tamaño recomendado: 1200×630px. Aparece como preview al compartir la URL en WhatsApp/Facebook.",
  },
  {
    key: "google_site_verification",
    type: "text",
    label: "Google Search Console — token de verificación",
    help: "Solo el contenido del meta tag, sin comillas. Ej: google-site-verification=ABC123 -> aquí pega ABC123.",
  },
];

// -------------------------------------------------------------
// Píxeles & Remarketing
// -------------------------------------------------------------
export const PIXELES_FIELDS: FieldDef[] = [
  {
    key: "ga4_id",
    type: "text",
    label: "Google Analytics 4 — Measurement ID",
    placeholder: "G-XXXXXXXXXX",
    help: "Identificador de tu propiedad GA4. Lo encuentras en Admin > Fuentes de datos > Web.",
    half: true,
  },
  {
    key: "gtm_id",
    type: "text",
    label: "Google Tag Manager — Container ID",
    placeholder: "GTM-XXXXXX",
    help: "Si usas GTM, introduce el container. Si solo usas GA4 directo, déjalo vacío.",
    half: true,
  },
  {
    key: "meta_pixel_id",
    type: "text",
    label: "Meta (Facebook) Pixel ID",
    placeholder: "123456789012345",
    help: "ID del pixel de Facebook. Lo encuentras en el Events Manager.",
    half: true,
  },
  {
    key: "tiktok_pixel_id",
    type: "text",
    label: "TikTok Pixel ID",
    placeholder: "CXXXXXXXXXXXXXXXX",
    half: true,
  },
  {
    key: "google_ads_id",
    type: "text",
    label: "Google Ads ID (AW-)",
    placeholder: "AW-CONVERSION_LABEL/AW-XXXXXXXX",
    help: "Para remarketing dinámico y conversiones de Google Ads.",
    half: true,
  },
  {
    key: "conversao_google_ads_id",
    type: "text",
    label: "Etiqueta de conversión de Google Ads",
    placeholder: "ABC123456",
    help: "La parte después de la barra en AW-XXXXXXXX/ABC123456.",
    half: true,
  },
];

// -------------------------------------------------------------
// Notificaciones automáticas
// -------------------------------------------------------------
export const NOTIF_FIELDS: FieldDef[] = [
  {
    key: "notificar_pedido_email_admin",
    type: "switch",
    label: "Avisar al admin por email al recibir un nuevo pedido",
  },
  {
    key: "email_admin",
    type: "email",
    label: "Email del admin para recibir notificaciones de pedidos",
    half: true,
  },
  {
    key: "notificar_pedido_whatsapp_admin",
    type: "switch",
    label: "Avisar al admin por WhatsApp al recibir un nuevo pedido",
  },
  {
    key: "whatsapp_admin",
    type: "text",
    label: "WhatsApp del admin (número con país, sin +)",
    placeholder: "51987654321",
    half: true,
  },
  {
    key: "confirmacion_cliente_asunto",
    type: "text",
    label: "Asunto — email de confirmación al cliente",
  },
  {
    key: "confirmacion_cliente_cuerpo",
    type: "textarea",
    label: "Cuerpo — email de confirmación al cliente",
    help: "Se incluye el detalle del pedido automáticamente.",
  },
  {
    key: "recordatorio_cliente_asunto",
    type: "text",
    label: "Asunto — email de recordatorio de recojo",
  },
  {
    key: "recordatorio_cliente_cuerpo",
    type: "textarea",
    label: "Cuerpo — email de recordatorio de recojo",
  },
];
