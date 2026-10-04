-- ==========================================================
-- Migration: Configuración de Productos e Insumos (Papel Azúcar y Arroz)
-- ==========================================================

INSERT INTO public.tienda_config (seccion, data)
VALUES (
  'productos',
  '{
    "papel_azucar_activo": true,
    "papel_arroz_activo": true,
    "papel_azucar_aviso": "Papel de Azúcar temporalmente sin stock.",
    "papel_arroz_aviso": "Papel de Arroz temporalmente sin stock."
  }'::jsonb
)
ON CONFLICT (seccion) DO NOTHING;

-- Actualizar política de lectura pública para incluir 'productos'
DROP POLICY IF EXISTS "Publico lee configuracion publica" ON public.tienda_config;
CREATE POLICY "Publico lee configuracion publica"
  ON public.tienda_config FOR SELECT
  USING (
    seccion IN ('tienda','contacto','marketing','seo','pixeles','productos')
  );

NOTIFY pgrst, 'reload schema';
