-- ==========================================================
-- Kelly's Cake
-- Fix: acceso a producto_presentaciones y creación de
-- producto_precio_cantidad (tiers de precio por cantidad)
-- ----------------------------------------------------------
-- Síntomas que corrige:
--   1) "permission denied for table producto_presentaciones"
--      → faltaban GRANTs y políticas RLS.
--   2) "Could not find the table producto_precio_cantidad"
--      → la tabla no existía en la BD.
-- ==========================================================

-- ==========================================================
-- 1) PRODUCTO_PRESENTACIONES
-- ==========================================================

-- Default de activo = true (el admin no siempre lo envía al insertar)
ALTER TABLE public.producto_presentaciones
  ALTER COLUMN activo SET DEFAULT true;

-- Permisos
GRANT SELECT ON public.producto_presentaciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.producto_presentaciones TO authenticated;
GRANT ALL ON public.producto_presentaciones TO service_role;

-- RLS
ALTER TABLE public.producto_presentaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pública (la tienda filtra activo=false en la app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read producto_presentaciones'
  ) THEN
    CREATE POLICY "Public read producto_presentaciones"
      ON public.producto_presentaciones
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Admin full access (mismo criterio que el resto de tablas del admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin full access on producto_presentaciones'
  ) THEN
    CREATE POLICY "Admin full access on producto_presentaciones"
      ON public.producto_presentaciones
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.clientes c
          WHERE c.user_id = auth.uid()
            AND c.rol = 'admin'
            AND c.activo = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.clientes c
          WHERE c.user_id = auth.uid()
            AND c.rol = 'admin'
            AND c.activo = true
        )
      );
  END IF;
END $$;

-- ==========================================================
-- 2) PRODUCTO_PRECIO_CANTIDAD (tiers: 25 und → S/. X)
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

CREATE INDEX IF NOT EXISTS idx_producto_precio_cantidad_producto
  ON public.producto_precio_cantidad(producto_id);

GRANT ALL ON public.producto_precio_cantidad TO service_role;
GRANT SELECT ON public.producto_precio_cantidad TO anon;
GRANT SELECT ON public.producto_precio_cantidad TO authenticated;

ALTER TABLE public.producto_precio_cantidad ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin full access on producto_precio_cantidad'
  ) THEN
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
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.clientes c
          WHERE c.user_id = auth.uid()
            AND c.rol = 'admin'
            AND c.activo = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read producto_precio_cantidad'
  ) THEN
    CREATE POLICY "Public read producto_precio_cantidad"
      ON public.producto_precio_cantidad
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Recargar schema para PostgREST
NOTIFY pgrst, 'reload schema';
