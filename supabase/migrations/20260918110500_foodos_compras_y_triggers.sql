-- ============================================
-- FOODOS AI - MÓDULO DE COMPRAS Y CASCADA DE COSTOS
-- ============================================

-- 1. TABLAS
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES proveedores(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_factura VARCHAR(100),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id),
  cantidad DECIMAL(10,4) NOT NULL,
  precio_total DECIMAL(10,4) NOT NULL,
  precio_unitario DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN cantidad > 0 THEN precio_total / cantidad ELSE 0 END
  ) STORED
);

-- RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant ALL" ON proveedores FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Aislamiento por tenant ALL" ON compras FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());
CREATE POLICY "Items compras heredan de compras" ON compra_items FOR ALL
USING (compra_id IN (SELECT id FROM compras WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (compra_id IN (SELECT id FROM compras WHERE tenant_id = get_user_tenant_id()));

-- ============================================
-- 2. LÓGICA DE ACTUALIZACIÓN DE PRECIOS
-- ============================================

-- Trigger: Al registrar compra, actualizar costo_unitario del ingrediente
CREATE OR REPLACE FUNCTION update_ingrediente_cost_from_compra()
RETURNS TRIGGER AS $$
BEGIN
  -- Usamos el último precio de compra para el costeo de reposición
  UPDATE ingredientes
  SET costo_unitario = NEW.precio_unitario
  WHERE id = NEW.ingrediente_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ingrediente_cost
AFTER INSERT OR UPDATE ON compra_items
FOR EACH ROW
EXECUTE FUNCTION update_ingrediente_cost_from_compra();


-- ============================================
-- 3. EFECTO CASCADA (RECÁLCULO DE RECETAS)
-- ============================================

-- Helper: Calcula costo línea exacto con mermas
CREATE OR REPLACE FUNCTION calculate_costo_linea(p_cantidad NUMERIC, p_merma_ingrediente NUMERIC, p_merma_item NUMERIC, p_costo_uso NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  merma_total NUMERIC;
  factor NUMERIC;
BEGIN
  merma_total := (COALESCE(p_merma_ingrediente, 0) + COALESCE(p_merma_item, 0)) / 100.0;
  IF merma_total >= 1.0 THEN merma_total := 0.99; END IF;
  factor := 1.0 - merma_total;
  RETURN (p_cantidad / factor) * p_costo_uso;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: Efecto cascada
CREATE OR REPLACE FUNCTION recalculate_recipes_on_ingredient_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el costo de uso y la merma no cambiaron, no hacemos nada
  IF OLD.costo_por_unidad_uso = NEW.costo_por_unidad_uso AND OLD.porcentaje_merma_estandar = NEW.porcentaje_merma_estandar THEN
    RETURN NEW;
  END IF;

  -- 1. Actualizar el costo_linea de todos los receta_items afectados
  UPDATE receta_items ri
  SET costo_linea = calculate_costo_linea(ri.cantidad, NEW.porcentaje_merma_estandar, ri.merma_porcentaje, NEW.costo_por_unidad_uso)
  WHERE ri.ingrediente_id = NEW.id;

  -- 2. Recalcular costo total de las recetas afectadas
  WITH recipe_costs AS (
    SELECT r.id as receta_id, COALESCE(SUM(ri.costo_linea), 0) as total
    FROM recetas r
    JOIN receta_items ri ON ri.receta_id = r.id
    WHERE r.id IN (SELECT receta_id FROM receta_items WHERE ingrediente_id = NEW.id)
    GROUP BY r.id
  )
  UPDATE recetas
  SET 
    costo_total = rc.total,
    costo_unitario = (rc.total / NULLIF(rendimiento, 0))
  FROM recipe_costs rc
  WHERE recetas.id = rc.receta_id;

  -- 3. Actualizar precio_costo en productos finales
  UPDATE productos p
  SET precio_costo = r.costo_unitario
  FROM recetas r
  WHERE p.id = r.producto_id
    AND r.id IN (SELECT receta_id FROM receta_items WHERE ingrediente_id = NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_recipes
AFTER UPDATE ON ingredientes
FOR EACH ROW
EXECUTE FUNCTION recalculate_recipes_on_ingredient_change();

