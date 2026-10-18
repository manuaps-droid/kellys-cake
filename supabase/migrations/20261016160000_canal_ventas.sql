-- ==========================================================
-- Kelly's Cake · FoodOS
-- Canal de ventas: distingue web vs vending vs directo
-- para medir cada canal de forma individual en el Pulso
-- del Negocio y en los KPIs de FoodOS.
-- Aplicar con: npx supabase db push (o SQL Editor)
-- ==========================================================

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS canal TEXT NOT NULL DEFAULT 'web';

-- Compatibilidad: los pedidos existentes quedan como 'web'
UPDATE public.pedidos SET canal = 'web' WHERE canal IS NULL OR canal = '';

CREATE INDEX IF NOT EXISTS idx_pedidos_canal
  ON public.pedidos (canal, created_at DESC);

NOTIFY pgrst, 'reload schema';
