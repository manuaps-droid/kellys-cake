-- =========================================================
-- SCRIPT DE CARGA MASIVA: RECETAS OFICIALES PREMEZCLAS Premium
-- =========================================================

DO $$ 
DECLARE
  v_tenant_id UUID;
  
  -- IDs Ingredientes (Premezclas Premium)
  id_ing_prem_vainilla UUID := gen_random_uuid();
  id_ing_prem_choco UUID := gen_random_uuid();
  id_ing_prem_redvelvet UUID := gen_random_uuid();
  id_ing_prem_brownie UUID := gen_random_uuid();
  id_ing_prem_chifon UUID := gen_random_uuid();
  id_ing_prem_carrot UUID := gen_random_uuid();
  
  -- IDs Ingredientes (Complementos)
  id_ing_huevos UUID := gen_random_uuid();
  id_ing_aceite UUID := gen_random_uuid();
  id_ing_agua UUID := gen_random_uuid();
  id_ing_zanahoria UUID := gen_random_uuid();
  id_ing_pecanas UUID := gen_random_uuid();

  -- IDs Productos
  id_prod_vainilla UUID := gen_random_uuid();
  id_prod_choco UUID := gen_random_uuid();
  id_prod_redvelvet UUID := gen_random_uuid();
  id_prod_brownie UUID := gen_random_uuid();
  id_prod_chifon UUID := gen_random_uuid();
  id_prod_carrot UUID := gen_random_uuid();

  -- IDs Recetas
  id_rec_vainilla UUID := gen_random_uuid();
  id_rec_choco UUID := gen_random_uuid();
  id_rec_redvelvet UUID := gen_random_uuid();
  id_rec_brownie UUID := gen_random_uuid();
  id_rec_chifon UUID := gen_random_uuid();
  id_rec_carrot UUID := gen_random_uuid();

BEGIN
  -- 1. Obtener tenant
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'No se encontró el negocio registrado.'; END IF;

  -- 2. INSERTAR INGREDIENTES (Con precios referenciales por bolsa de 5kg o 1kg)
  INSERT INTO ingredientes (id, tenant_id, nombre, unidad_compra, cantidad_compra, costo_unitario, unidad_uso, factor_conversion, porcentaje_merma_estandar) VALUES
  (id_ing_prem_vainilla, v_tenant_id, 'Deluxe Creme Cake Vainilla ', 'Saco', 5, 75.00, 'gramos', 5000, 0),
  (id_ing_prem_choco, v_tenant_id, 'Deluxe Creme Cake Chocolate ', 'Saco', 5, 80.00, 'gramos', 5000, 0),
  (id_ing_prem_redvelvet, v_tenant_id, 'Premezcla Red Velvet ', 'Bolsa', 1, 22.00, 'gramos', 1000, 0),
  (id_ing_prem_brownie, v_tenant_id, 'Premezcla Brownie ', 'Bolsa', 1, 18.00, 'gramos', 1000, 0),
  (id_ing_prem_chifon, v_tenant_id, 'Chifón ChocoMix ', 'Bolsa', 1, 19.50, 'gramos', 1000, 0),
  (id_ing_prem_carrot, v_tenant_id, 'Premezcla Carrot Cake ', 'Bolsa', 1, 20.00, 'gramos', 1000, 0),
  
  -- Complementos básicos
  (id_ing_huevos, v_tenant_id, 'Huevos (Complemento)', 'Plancha', 30, 16.00, 'gramos', 1800, 5), -- 1800g por plancha aprox
  (id_ing_aceite, v_tenant_id, 'Aceite Vegetal (Complemento)', 'Litro', 1, 8.50, 'gramos', 1000, 0),
  (id_ing_agua, v_tenant_id, 'Agua Filtrada', 'Litro', 1, 1.00, 'gramos', 1000, 0),
  (id_ing_zanahoria, v_tenant_id, 'Zanahoria Fresca', 'Kilo', 1, 3.50, 'gramos', 1000, 15), -- 15% merma al pelar
  (id_ing_pecanas, v_tenant_id, 'Pecanas Picadas', 'Kilo', 1, 45.00, 'gramos', 1000, 0);

  -- 3. INSERTAR PRODUCTOS
  INSERT INTO productos (id, tenant_id, nombre, descripcion, precio_venta) VALUES
  (id_prod_vainilla, v_tenant_id, 'Torta Húmeda Vainilla  - 20 Porciones', 'Miga suave y húmeda', 65.00),
  (id_prod_choco, v_tenant_id, 'Torta Húmeda Chocolate  - 20 Porciones', 'Intenso sabor a cacao', 70.00),
  (id_prod_redvelvet, v_tenant_id, 'Torta Red Velvet  - 15 Porciones', 'Rojo vibrante', 85.00),
  (id_prod_brownie, v_tenant_id, 'Plancha de Brownies Premium', 'Melcochudo y denso', 55.00),
  (id_prod_chifon, v_tenant_id, 'Chifón de Chocolate Premium', 'Súper esponjoso y alto', 40.00),
  (id_prod_carrot, v_tenant_id, 'Carrot Cake Premium - 15 Porciones', 'Con zanahoria y pecanas', 75.00);

  -- 4. INSERTAR RECETAS (Rendimiento 1 batch por cada kilo de premezcla)
  INSERT INTO recetas (id, tenant_id, producto_id, nombre, rendimiento, costo_total, costo_unitario, es_activa) VALUES
  (id_rec_vainilla, v_tenant_id, id_prod_vainilla, 'Formulación Premium Vainilla', 1, 0, 0, true),
  (id_rec_choco, v_tenant_id, id_prod_choco, 'Formulación Premium Chocolate', 1, 0, 0, true),
  (id_rec_redvelvet, v_tenant_id, id_prod_redvelvet, 'Formulación Premium Red Velvet', 1, 0, 0, true),
  (id_rec_brownie, v_tenant_id, id_prod_brownie, 'Formulación Premium Brownie', 1, 0, 0, true),
  (id_rec_chifon, v_tenant_id, id_prod_chifon, 'Formulación Premium Chifón', 1, 0, 0, true),
  (id_rec_carrot, v_tenant_id, id_prod_carrot, 'Formulación Premium Carrot Cake', 1, 0, 0, true);

  -- 5. INSERTAR FORMULACIONES (RECETA ITEMS)
  
  -- 5.1 Vainilla (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_vainilla, id_ing_prem_vainilla, 1000, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_vainilla, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.2 Chocolate (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_choco, id_ing_prem_choco, 1000, 'gramos', 0, 0),
  (id_rec_choco, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_choco, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_choco, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.3 Red Velvet (Base: 1kg polvo, 350g huevo, 300g aceite, 225g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_redvelvet, id_ing_prem_redvelvet, 1000, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_huevos, 350, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_redvelvet, id_ing_agua, 225, 'gramos', 0, 0);

  -- 5.4 Brownie (Base: 1kg polvo, 200g huevo, 200g aceite, 100g agua, 100g pecanas)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_brownie, id_ing_prem_brownie, 1000, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_huevos, 200, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_aceite, 200, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_agua, 100, 'gramos', 0, 0),
  (id_rec_brownie, id_ing_pecanas, 100, 'gramos', 0, 0);

  -- 5.5 Chifón ChocoMix (Base: 1kg polvo, 650g huevo, 150g aceite, 150g agua)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_chifon, id_ing_prem_chifon, 1000, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_huevos, 650, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_aceite, 150, 'gramos', 0, 0),
  (id_rec_chifon, id_ing_agua, 150, 'gramos', 0, 0);

  -- 5.6 Carrot Cake (Base: 1kg polvo, 300g huevo, 300g aceite, 200g agua, 200g zanahoria)
  INSERT INTO receta_items (receta_id, ingrediente_id, cantidad, unidad, merma_porcentaje, costo_linea) VALUES
  (id_rec_carrot, id_ing_prem_carrot, 1000, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_huevos, 300, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_aceite, 300, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_agua, 200, 'gramos', 0, 0),
  (id_rec_carrot, id_ing_zanahoria, 200, 'gramos', 0, 0);

  -- 6. Trigger Cascada de Costos: Obligamos a la BD a recalcular todo actualizando el costo por sí mismo.
  UPDATE ingredientes SET costo_unitario = costo_unitario WHERE tenant_id = v_tenant_id;

END $$;

