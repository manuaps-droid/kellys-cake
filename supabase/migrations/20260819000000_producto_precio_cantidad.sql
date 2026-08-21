-- ==========================================================
-- Kelly's Cake
-- Tabla de precios por cantidad para productos coffee_break
-- ----------------------------------------------------------
-- Permite definir tiers de precios: 25 und → S/. X, 50 und → S/. Y, etc.
-- El usuario ve el precio mínimo en la foto y puede desplegar
-- una lista con todas las relaciones cantidad → precio.
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.producto_precio_cantidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad_minima INT NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(producto_id, cantidad_minima)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_producto_precio_cantidad_producto
  ON public.producto_precio_cantidad(producto_id);

-- Permisos
GRANT ALL ON public.producto_precio_cantidad TO service_role;
GRANT SELECT ON public.producto_precio_cantidad TO anon;
GRANT SELECT ON public.producto_precio_cantidad TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS
ALTER TABLE public.producto_precio_cantidad ENABLE ROW LEVEL SECURITY;

-- Admin full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access on producto_precio_cantidad') THEN
    CREATE POLICY "Admin full access on producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.clientes c
          WHERE c.user_id = auth.uid()
            AND c.rol = 'admin'
            AND c.activo = true
        )
      );
  END IF;
END $$;

-- Lectura pública
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read producto_precio_cantidad') THEN
    CREATE POLICY "Public read producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR SELECT
      USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
