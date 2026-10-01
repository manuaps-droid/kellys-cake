-- Precio y descripción por imagen en catalogo_imagenes (catálogo Toppers)
ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Permisos UPDATE reafirmados para las nuevas columnas
GRANT UPDATE ON public.catalogo_imagenes TO service_role;
GRANT UPDATE ON public.catalogo_imagenes TO authenticated;