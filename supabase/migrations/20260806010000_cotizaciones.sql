-- ==========================================================
-- Kelly's Cake
-- Cotizaciones: documento de cotización generado por el admin
-- + soporte de items de cotización en carrito y pedidos
-- ==========================================================

-- 1) Secuencia para el número correlativo de cotización
CREATE SEQUENCE IF NOT EXISTS cotizaciones_numero_seq;

-- 2) Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL DEFAULT nextval('cotizaciones_numero_seq'),
  catering_id UUID REFERENCES public.cotizaciones_catering(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  celular TEXT,
  tipo_evento TEXT,
  fecha_evento DATE,
  num_invitados INTEGER,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'enviada' CHECK (estado IN ('enviada', 'aceptada', 'rechazada')),
  token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de updated_at reutilizando la función existente
DROP TRIGGER IF EXISTS set_cotizaciones_updated_at ON public.cotizaciones;
CREATE TRIGGER set_cotizaciones_updated_at
  BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS: la lectura pública se hace con service role desde la página pública.
-- Se habilita RLS para impedir inserciones anónimas.
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read cotizaciones" ON public.cotizaciones;
CREATE POLICY "Public can read cotizaciones"
  ON public.cotizaciones FOR SELECT
  USING (true);

-- Permisos: service_role gestiona cotizaciones; anon/authenticated solo leen.
GRANT ALL ON public.cotizaciones TO service_role;
GRANT SELECT ON public.cotizaciones TO anon;
GRANT SELECT ON public.cotizaciones TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.cotizaciones_numero_seq TO service_role;
GRANT USAGE ON SEQUENCE public.cotizaciones_numero_seq TO anon;
GRANT USAGE ON SEQUENCE public.cotizaciones_numero_seq TO authenticated;

-- 3) carrito_items: soporte para items de cotización con precio fijo
ALTER TABLE public.carrito_items
  ADD COLUMN IF NOT EXISTS precio_unitario NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS imagen TEXT,
  ADD COLUMN IF NOT EXISTS cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE CASCADE;

-- Un item de carrito puede no referenciar un producto de catálogo (items de cotización)
ALTER TABLE public.carrito_items ALTER COLUMN producto_id DROP NOT NULL;

-- 4) pedido_items: guardar nombre/descripcion/imagen de items de cotización
ALTER TABLE public.pedido_items
  ADD COLUMN IF NOT EXISTS nombre TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS imagen TEXT;

ALTER TABLE public.pedido_items ALTER COLUMN producto_id DROP NOT NULL;

-- 5) pedidos: registrar tipo de pago (abono/total), monto pagado y cotización vinculada
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS tipo_pago TEXT,
  ADD COLUMN IF NOT EXISTS monto_pagado NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
