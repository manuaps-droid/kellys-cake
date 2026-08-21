-- ==========================================================
-- Kelly's Cake
-- Mostrar catálogos en páginas públicas
-- ----------------------------------------------------------
-- Añade columnas booleanas a catalogo_personalizacion para
-- controlar la visibilidad de los catálogos en cada área
-- pública/productos del admin.
-- ==========================================================

ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS mostrar_en_productos BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mostrar_en_categorias BOOLEAN NOT NULL DEFAULT false;

-- Por defecto, los catálogos existentes que son de celebración
-- se muestran en la página principal (manteniendo el behavior
-- anterior al filtro activo=true+celebration).
UPDATE public.catalogo_personalizacion
SET mostrar_en_categorias = true
WHERE tipo = 'celebration' AND activo = true;

NOTIFY pgrst, 'reload schema';
