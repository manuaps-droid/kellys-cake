-- ==========================================
-- SCRIPT DE CARGA: PRODUCTOS Y RECETAS Premium
-- Para ejecutar en el SQL Editor de Supabase
-- ==========================================

DO $$ 
DECLARE
  v_tenant_id UUID;
  -- IDs de ingredientes
  id_premezcla_vainilla UUID := gen_random_uuid();
  id_bizcochuelo_plus UUID := gen_random_uuid();
  id_pettinice UUID := gen_random_uuid();
  id_lesfruits UUID := gen_random_uuid();
  id_ovalett UUID := gen_random_uuid();
  id_huevos UUID := gen_random_uuid();
  id_aceite UUID := gen_random_uuid();
  id_agua UUID := gen_random_uuid();
  
  -- IDs de productos y recetas
  id_prod_deluxe UUID := gen_random_uuid();
  id_receta_deluxe UUID := gen_random_uuid();
  
  id_prod_bizcochuelo UUID := gen_random_uuid();
  id_receta_bizcochuelo UUID := gen_random_uuid();
BEGIN
  -- 1. Obtener el tenant actual (Asumimos que es Kellys Cake)
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún negocio (tenant) registrado.';
  END IF;

  -- ==========================================
  -- 2. INSERTAR INGREDIENTES Premium Y BÁSICOS
  -- ==========================================
  INSERT INTO ingredientes (id, tenant_id, nombre, categoria_id, unidad_compra, cantidad_compra, costo_unitario, unidad_uso, factor_conversion, porcentaje_merma_estandar) VALUES
  (id_premezcla_vainilla, v_tenant_id, 'Premezcla Deluxe Creme Cake Vainilla ', NULL, 'Bolsa', 1, 15.00, 'gramos', 1000, 0),
  (id_bizcochuelo_plus, v_tenant_id, 'Bizcochuelo Plus ', NULL, 'Bolsa', 1, 14.50, 'gramos', 1000, 0),
  (id_pettinice, v_tenant_id, 'Pettinice Blanco ', NULL, 'Caja', 5, 85.00, 'gramos', 5000, 2),
  (id_lesfruits, v_tenant_id, 'Les Fruits Fresa ', NULL, 'Manga', 1, 16.00, 'gramos', 1000, 2),
  (id_ovalett, v_tenant_id, 'Ovalett Super ', NULL, 'Balde', 1, 25.00, 'gramos', 1000, 1),
  (id_huevos, v_tenant_id, 'Huevos Comerciales', NULL, 'Jaba', 30, 15.00, 'gramos', 1500, 5), -- aprox 50g c/u
  (id_aceite, v_tenant_id, 'Aceite Vegetal', NULL, 'Litro', 1, 8.00, 'gramos', 1000, 1),
  (id_agua, v_tenant_id, 'Agua Purificada', NULL, 'Litro', 1, 1.00, 'gramos', 1000, 0);

  -- ==========================================
  -- 3. INSERTAR PRODUCTOS (Catálogo)
  -- ==========================================
  INSERT INTO productos (id, tenant_id, nombre, descripcion, precio_venta, categoria_id) VALUES
  (id_prod_deluxe, v_tenant_id, 'Torta Húmeda Deluxe Vainilla (Molde 20cm)', 'Hecha con premezcla Premium Premium', 45.00, NULL),
  (id_prod_bizcochuelo, v_tenant_id, 'Torta Bizcochuelo Base', 'Base ligera y esponjosa de Bizcochuelo Plus', 35.00, NULL);

  -- ==========================================
  -- 4. INSERTAR RECETAS (La cabecera)
  -- ==========================================
  -- Receta Deluxe (Rendimiento 1 molde)
  INSERT INTO recetas (id, tenant_id, producto_id, nombre, rendimiento, costo_total, costo_unitario, es_activa) VALUES
  (id_receta_deluxe, v_tenant_id, id_prod_deluxe, 'Receta Oficial Deluxe Vainilla', 1, 0, 0, true);

  -- Receta Bizcochuelo Plus
  INSERT INTO recetas (id, tenant_id, producto_id, nombre, rendimiento, costo_total, costo_unitario, es_activa) VALUES
  (id_receta_bizcochuelo, v_tenant_id, id_prod_bizcochuelo, 'Receta Oficial Bizcochuelo Plus', 1, 0, 0, true);

  -- ==========================================
  -- 5. INSERTAR ITEMS DE RECETA (Formulación)
  -- ==========================================
  
  -- Items Receta Deluxe Vainilla
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_receta_deluxe, id_premezcla_vainilla, 500, 'gramos', 0, 0),
  (id_receta_deluxe, id_huevos, 250, 'gramos', 0, 0),
  (id_receta_deluxe, id_aceite, 150, 'gramos', 0, 0),
  (id_receta_deluxe, id_agua, 110, 'gramos', 0, 0);

  -- Items Receta Bizcochuelo Plus
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_receta_bizcochuelo, id_bizcochuelo_plus, 500, 'gramos', 0, 0),
  (id_receta_bizcochuelo, id_huevos, 500, 'gramos', 0, 0),
  (id_receta_bizcochuelo, id_agua, 100, 'gramos', 0, 0);

  -- NOTA: Para forzar el Trigger de Efecto Cascada que calculará los costos matemáticos de estas recetas y actualizará el precio_costo de los productos, 
  -- haremos un "toque" a los ingredientes actualizando un campo invisible.
  UPDATE ingredientes SET costo_unitario = costo_unitario WHERE tenant_id = v_tenant_id;

END $$;

