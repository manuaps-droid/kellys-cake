-- ==========================================================
-- Kelly's Cake
-- Foto de portada por catálogo
-- ----------------------------------------------------------
-- Añade la columna es_portada a catalogo_imagenes para que el
-- admin marque qué foto representa al catálogo en el área de
-- "Explora nuestras categorías" de la página principal.
-- ==========================================================

ALTER TABLE public.catalogo_imagenes
  ADD COLUMN IF NOT EXISTS es_portada BOOLEAN NOT NULL DEFAULT false;

-- Backfill: la primera imagen (menor orden) de cada catálogo de
-- celebración queda como portada por defecto.
WITH first_images AS (
  SELECT DISTINCT ON (catalogo_id)
    catalogo_id,
    id
  FROM public.catalogo_imagenes
  WHERE catalogo_id IN (
    SELECT id FROM public.catalogo_personalizacion
    WHERE tipo = 'celebration' AND activo = true
  )
  ORDER BY catalogo_id, orden ASC, id ASC
)
UPDATE public.catalogo_imagenes
SET es_portada = true
FROM first_images
WHERE public.catalogo_imagenes.id = first_images.id;

NOTIFY pgrst, 'reload schema';
