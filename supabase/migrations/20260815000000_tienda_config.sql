-- ==========================================================
-- Kelly's Cake
-- Configuración general de la tienda (marketing digital).
--
-- Tabla `tienda_config`: key-value JSONB. Una fila por sección
-- lógica (tienda, contacto, marketing, seo, pixeles, notif).
-- El admin actualiza vía Server Action; el storefront lee
-- la sección pública que necesita en cada render.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.tienda_config (
  seccion      TEXT PRIMARY KEY,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tienda_config_updated ON public.tienda_config;
CREATE TRIGGER trg_tienda_config_updated
  BEFORE UPDATE ON public.tienda_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- Seed con valores por defecto (seeds idempotentes)
-- -------------------------------------------------------------
INSERT INTO public.tienda_config (seccion, data) VALUES
  (
    'tienda',
    '{
      "nombre": "Kelly''s Cake",
      "tagline": "Pasteles personalizados de alta costura",
      "descripcion": "Creamos pasteles artesanales personalizados para bodas, cumpleaños y ocasiones especiales. Diseños únicos, ingredientes premium.",
      "moneda": "PEN",
      "simbolo": "S/",
      "zona_cobertura": "Arequipa metropolitana y alrededores",
      "logo_url": null
    }'::jsonb
  ),
  (
    'contacto',
    '{
      "telefono": "",
      "whatsapp": "",
      "email": "",
      "direccion": "",
      "maps_url": "",
      "horario_lunes_viernes": "09:00 - 19:00",
      "horario_sabado": "10:00 - 14:00",
      "horario_domingo": "Cerrado",
      "instagram": "",
      "facebook": "",
      "tiktok": "",
      "youtube": "",
      "whatsapp_activo": false,
      "whatsapp_mensaje": "Hola, vengo de la web. ¿Me podrías ayudar con un pastel personalizado?"
    }'::jsonb
  ),
  (
    'marketing',
    '{
      "banner_activo": false,
      "banner_titulo": "",
      "banner_texto": "",
      "banner_color": "#D8B07A",
      "banner_link": "",
      "envio_gratis_umbral": null,
      "mostrar_testimonios": true,
      "carrito_abandonado_minutos": null,
      "carrito_abandonado_mensaje": ""
    }'::jsonb
  ),
  (
    'seo',
    '{
      "title": "Kelly''s Cake | Pasteles Personalizados de Alta Costura",
      "description": "Creamos pasteles artesanales personalizados para bodas, cumpleaños y ocasiones especiales. Diseños únicos, ingredientes premium.",
      "keywords": "",
      "og_image_url": null,
      "google_site_verification": null
    }'::jsonb
  ),
  (
    'pixeles',
    '{
      "ga4_id": null,
      "gtm_id": null,
      "meta_pixel_id": null,
      "tiktok_pixel_id": null,
      "google_ads_id": null,
      "conversao_google_ads_id": null
    }'::jsonb
  ),
  (
    'notificaciones',
    '{
      "notificar_pedido_email_admin": true,
      "email_admin": "",
      "notificar_pedido_whatsapp_admin": false,
      "whatsapp_admin": "",
      "confirmacion_cliente_asunto": "Confirmamos tu pedido - Kelly''s Cake",
      "confirmacion_cliente_cuerpo": "Gracias por tu pedido. Nos pondremos en contacto para coordinar los detalles.",
      "recordatorio_cliente_asunto": "Tu pedido está listo para recojo",
      "recordatorio_cliente_cuerpo": "Tu pedido ya está listo. Te esperamos en tienda."
    }'::jsonb
  )
ON CONFLICT (seccion) DO NOTHING;

-- -------------------------------------------------------------
-- RLS: solo admins (rol admin en clientes) pueden leer y escribir.
-- Lectura pública la hace el service_role desde el storefront.
-- -------------------------------------------------------------
ALTER TABLE public.tienda_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins leen tienda_config" ON public.tienda_config;
CREATE POLICY "Admins leen tienda_config"
  ON public.tienda_config FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins actualizan tienda_config" ON public.tienda_config;
CREATE POLICY "Admins actualizan tienda_config"
  ON public.tienda_config FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins insertan tienda_config" ON public.tienda_config;
CREATE POLICY "Admins insertan tienda_config"
  ON public.tienda_config FOR INSERT
  WITH CHECK (public.is_admin());

-- Lectura pública (storefront) para secciones no sensibles.
-- Leemos las secciones explícitamente públicas para no exponer
-- configuración interna (notificaciones admin, emails). Los IDs
-- de píxeles sí van visibles en HTML en cualquier sitio web.
DROP POLICY IF EXISTS "Publico lee configuracion publica" ON public.tienda_config;
CREATE POLICY "Publico lee configuracion publica"
  ON public.tienda_config FOR SELECT
  USING (
    seccion IN ('tienda','contacto','marketing','seo','pixeles')
  );

-- -------------------------------------------------------------
-- Privilegios explícitos (en este proyecto los roles no heredan
-- privilegios por defecto sobre tablas nuevas).
-- -------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tienda_config TO service_role;
GRANT SELECT ON public.tienda_config TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
