-- ==========================================================
-- Kelly's Cake - Contador de Visitas Diarias
-- Inicialización de fila de analítica en tienda_config
-- ==========================================================

INSERT INTO public.tienda_config (seccion, data)
VALUES (
  'analytics_visitas',
  '{"total_historico": 0, "dias": {}}'::jsonb
)
ON CONFLICT (seccion) DO NOTHING;
