-- ==========================================================
-- Kelly's Cake
-- Fase 3: Blog CMS y Flag de Ruleta
-- ==========================================================

-- 1. Añadir flag de ruleta a clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ruleta_girada BOOLEAN NOT NULL DEFAULT false;

-- 2. Tabla de Categorías del Blog
CREATE TABLE IF NOT EXISTS public.blog_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla de Posts del Blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  extracto TEXT,
  contenido TEXT NOT NULL,
  imagen_url TEXT,
  categoria_id UUID REFERENCES public.blog_categorias(id) ON DELETE SET NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado')),
  seo_title VARCHAR(255),
  seo_description TEXT,
  publicado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_estado ON public.blog_posts (estado);

-- RLS y Permisos
ALTER TABLE public.blog_categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.blog_categorias TO service_role;
GRANT SELECT ON public.blog_categorias TO authenticated, anon;

GRANT ALL ON public.blog_posts TO service_role;
GRANT SELECT ON public.blog_posts TO authenticated, anon;

-- Seed básico de categorías
INSERT INTO public.blog_categorias (nombre, slug) VALUES 
('Bodas', 'bodas'),
('Cumpleaños', 'cumpleanos'),
('Tips y Consejos', 'tips-y-consejos'),
('Tendencias', 'tendencias')
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
