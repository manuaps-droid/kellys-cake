-- ==========================================================
-- Alineación del historial de migraciones
-- ----------------------------------------------------------
-- Las migraciones aplicadas manualmente (vía SQL editor) no
-- quedaron registradas en supabase_migrations.schema_migrations.
-- Este archivo:
--   1) Verifica que los objetos clave existan en la DB.
--   2) Registra las versiones pendientes para que el CLI las
--      considere ya aplicadas (sin re-ejecutar su DDL).
-- Es idempotente (ON CONFLICT DO NOTHING).
-- ==========================================================

DO $$
DECLARE
  v_missing text[] := ARRAY[]::text[];
BEGIN
  IF to_regclass('public.contactos') IS NULL THEN
    v_missing := array_append(v_missing, 'contactos');
  END IF;

  IF to_regclass('public.catalogo_imagenes') IS NULL THEN
    v_missing := array_append(v_missing, 'catalogo_imagenes');
  END IF;

  IF to_regclass('public.cotizaciones') IS NULL THEN
    v_missing := array_append(v_missing, 'cotizaciones');
  END IF;

  IF to_regclass('public.tienda_config') IS NULL THEN
    v_missing := array_append(v_missing, 'tienda_config');
  END IF;

  IF to_regclass('public.libro_reclamaciones') IS NULL THEN
    v_missing := array_append(v_missing, 'libro_reclamaciones');
  END IF;

  IF to_regclass('public.rewards_niveles') IS NULL THEN
    v_missing := array_append(v_missing, 'rewards_niveles');
  END IF;

  IF to_regclass('public.resenas') IS NULL THEN
    v_missing := array_append(v_missing, 'resenas');
  END IF;

  IF to_regprocedure('public.create_order(jsonb)') IS NULL THEN
    v_missing := array_append(v_missing, 'create_order()');
  END IF;

  IF to_regprocedure('public.is_admin()') IS NULL THEN
    v_missing := array_append(v_missing, 'is_admin()');
  END IF;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION 'Alineación abortada: faltan objetos en la DB: %', v_missing;
  END IF;
END $$;

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260728000000', 'rls_clientes'),
  ('20260728010000', 'trigger_auto_cliente'),
  ('20260728020000', 'rls_clientes_insert'),
  ('20260728030000', 'disable_rls_clientes'),
  ('20260729000000', 'update_proyecto_statuses'),
  ('20260729010000', 'fix_proyecto_rls'),
  ('20260729020000', 'disable_rls_proyectos'),
  ('20260729030000', 'add_observaciones_consent'),
  ('20260729050000', 'create_contactos'),
  ('20260730060000', 'add_mas_vendido'),
  ('20260730070000', 'create_catalogo_imagenes'),
  ('20260803000000', '008_cotizaciones_catering'),
  ('20260804100000', 'add_label_catering_catalog'),
  ('20260804110000', 'add_proyecto_id_to_catering'),
  ('20260804120000', 'add_precio_coffee_break'),
  ('20260806000000', 'fix_coffee_break_public_reads'),
  ('20260806010000', 'cotizaciones'),
  ('20260807000000', 'fix_pedidos_pago'),
  ('20260807020000', 'pedidos_numero_admin_rls'),
  ('20260808000000', 'agenda_produccion'),
  ('20260809000000', 'catalogo_mostrar_en'),
  ('20260809010000', 'catalogo_imagenes_portada'),
  ('20260814000000', 'scalability_indexes'),
  ('20260814010000', 'create_order_rpc'),
  ('20260814020000', 'dashboard_stats_rpc'),
  ('20260815000000', 'tienda_config'),
  ('20260819000000', 'producto_precio_cantidad'),
  ('20260820000000', 'fix_presentaciones_y_tiers'),
  ('20260820010000', 'carrito_items_presentacion'),
  ('20260820020000', 'caja_personalizada'),
  ('20260820030000', 'libro_reclamaciones'),
  ('20260826000000', 'caja_6_12_18_24'),
  ('20260905000000', 'rewards_fidelizacion'),
  ('20260906000000', 'resenas_sistema'),
  ('20260907000000', 'fix_rls_recursion_clientes')
ON CONFLICT (version) DO NOTHING;