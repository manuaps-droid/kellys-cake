-- Añade columna `label` a catalogo_imagenes para titular cada tarjeta de catering
ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS label TEXT;

-- Permisos (ya existentes para SELECT/INSERT/DELETE, aquí reafirmamos UPDATE)
GRANT UPDATE ON public.catalogo_imagenes TO service_role;
GRANT UPDATE ON public.catalogo_imagenes TO authenticated;

-- Auto-crear catálogo "Catering" tipo catering_gallery (idempotente)
INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
SELECT 'catering_gallery', 'Catering', 'Galería de la página de catering — 6 imágenes con títulos editables', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalogo_personalizacion WHERE tipo = 'catering_gallery'
);

-- Permisos reafirmados
GRANT ALL ON public.catalogo_personalizacion TO service_role;
