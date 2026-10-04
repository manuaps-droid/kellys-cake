-- ==========================================================
-- Kelly's Cake - Seguridad por Hardware (3 Dispositivos Autorizados)
-- Restringe acceso a /admin y /foodos exclusivamente a 3 equipos.
-- ==========================================================

INSERT INTO public.tienda_config (seccion, data)
VALUES (
  'seguridad_dispositivos',
  '{
    "restringir_acceso": true,
    "clave_maestra": "KELLY-2026-SEGURA",
    "max_dispositivos": 3,
    "dispositivos": []
  }'::jsonb
)
ON CONFLICT (seccion) DO NOTHING;
