-- ==========================================================
-- Kelly's Cake · FoodOS
-- Suscripciones de notificaciones push (Web Push) para los
-- equipos autorizados de administracion (max. 3).
-- Aplicar con: npx supabase db push (o pegar en SQL Editor)
-- ==========================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID,
  dispositivo_nombre TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON public.push_subscriptions (endpoint);

-- Solo el servidor (service_role) puede leer/escribir
-- suscripciones: ningun cliente anonimo o autenticado.
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.push_subscriptions TO service_role;

NOTIFY pgrst, 'reload schema';
