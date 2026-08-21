-- ==========================================================
-- Kelly's Cake
-- Fix: lectura pública del catálogo coffee break
-- 1) Permite a anon/authenticated leer clientes (usado por políticas RLS)
-- 2) Asegura columna precio (idempotente)
-- ==========================================================

-- 1) Permisos: las políticas RLS de catalogo_personalizacion
--    consultan clientes; sin este GRANT las lecturas públicas fallan.
GRANT SELECT ON public.clientes TO anon;
GRANT SELECT ON public.clientes TO authenticated;

-- 2) Columna precio (si ya existe, no hace nada)
ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10,2);

-- 3) Permisos de lectura sobre el catálogo
GRANT SELECT ON public.catalogo_personalizacion TO anon;
GRANT SELECT ON public.catalogo_personalizacion TO authenticated;

-- 4) Recargar schema para PostgREST
NOTIFY pgrst, 'reload schema';
