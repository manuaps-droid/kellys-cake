-- ==========================================================
-- Kelly's Cake
-- Fix pedidos: columnas de pago esperadas por la app
-- y permisos de service_role para el panel admin.
-- (Las tablas pedidos/pedido_items fueron creadas manualmente
--  y no incluyen las columnas ni los GRANT que usa el código.)
-- ==========================================================

-- 1) Columnas de pago que inserta create-order.action.ts
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS metodo_pago TEXT,
  ADD COLUMN IF NOT EXISTS referencia_pago TEXT,
  ADD COLUMN IF NOT EXISTS estado_pago TEXT;

-- 2) Permisos: el panel admin lee pedidos con service_role
GRANT ALL ON public.pedidos TO service_role;
GRANT ALL ON public.pedido_items TO service_role;
GRANT ALL ON public.carrito_items TO service_role;

NOTIFY pgrst, 'reload schema';
