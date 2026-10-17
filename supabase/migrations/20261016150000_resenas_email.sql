-- ==========================================================
-- Kelly's Cake
-- Control de envio del email automatico de solicitud de
-- resena (2 dias despues de la entrega del pedido).
-- Aplicar con: npx supabase db push (o pegar en SQL Editor)
-- ==========================================================

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS resena_email_enviado TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
