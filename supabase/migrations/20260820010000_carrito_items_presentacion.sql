-- ==========================================================
-- Kelly's Cake
-- Carrito: soporte de presentaciones seleccionables
-- ==========================================================

ALTER TABLE public.carrito_items
  ADD COLUMN IF NOT EXISTS presentacion_id UUID
  REFERENCES public.producto_presentaciones(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_carrito_items_presentacion
  ON public.carrito_items(presentacion_id);

NOTIFY pgrst, 'reload schema';
