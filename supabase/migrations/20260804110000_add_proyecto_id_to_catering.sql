-- Añade columna proyecto_id a cotizaciones_catering para enlazar un proyecto personalizado
ALTER TABLE public.cotizaciones_catering
  ADD COLUMN IF NOT EXISTS proyecto_id UUID REFERENCES public.proyectos_personalizados(id) ON DELETE SET NULL;

-- Permisos
GRANT UPDATE ON public.cotizaciones_catering TO service_role;
GRANT SELECT ON public.proyectos_personalizados TO service_role;
