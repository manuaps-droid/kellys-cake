-- ==========================================================
-- Kelly's Cake
-- Sistema de reseñas de productos
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  foto_url TEXT,
  aprobada BOOLEAN NOT NULL DEFAULT false,
  puntos_otorgados INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un cliente solo puede reseñar un producto una vez
CREATE UNIQUE INDEX IF NOT EXISTS uq_resenas_cliente_producto
  ON public.resenas (cliente_id, producto_id);

CREATE INDEX IF NOT EXISTS idx_resenas_producto ON public.resenas (producto_id);
CREATE INDEX IF NOT EXISTS idx_resenas_cliente ON public.resenas (cliente_id);
CREATE INDEX IF NOT EXISTS idx_resenas_aprobada ON public.resenas (aprobada) WHERE aprobada = true;
CREATE INDEX IF NOT EXISTS idx_resenas_created ON public.resenas (created_at DESC);

-- RLS deshabilitado (auth manejada en código como en clientes)
ALTER TABLE public.resenas DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.resenas TO service_role;
GRANT SELECT, INSERT ON public.resenas TO authenticated;
GRANT SELECT ON public.resenas TO anon;

NOTIFY pgrst, 'reload schema';
