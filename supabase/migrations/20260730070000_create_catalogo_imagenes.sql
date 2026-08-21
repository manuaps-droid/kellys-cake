-- Tabla para almacenar múltiples imágenes por catálogo
CREATE TABLE IF NOT EXISTS public.catalogo_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalogo_id UUID NOT NULL REFERENCES public.catalogo_personalizacion(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_catalogo_imagenes_catalogo_id ON public.catalogo_imagenes(catalogo_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_imagenes_media_id ON public.catalogo_imagenes(media_id);

-- Permisos
GRANT ALL ON public.catalogo_imagenes TO service_role;
GRANT ALL ON public.catalogo_imagenes TO anon;
GRANT ALL ON public.catalogo_imagenes TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RLS
ALTER TABLE public.catalogo_imagenes ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
CREATE POLICY "Lectura pública de catalogo_imagenes"
  ON public.catalogo_imagenes
  FOR SELECT
  USING (true);
