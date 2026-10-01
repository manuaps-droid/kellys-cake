-- ============================================
-- FOODOS AI - POLÍTICAS DE SEGURIDAD RLS
-- ============================================

-- 1. Función Helper para obtener el tenant del usuario actual
-- Esto evita tener que escribir el SELECT completo en cada política
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$$
  SELECT tenant_id FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Políticas para 'tenants' (Los usuarios solo pueden ver/editar su propio negocio)
CREATE POLICY "Ver su propio negocio" ON tenants FOR SELECT
USING (id = get_user_tenant_id());

CREATE POLICY "Editar su propio negocio" ON tenants FOR UPDATE
USING (id = get_user_tenant_id());

-- 3. Políticas para 'usuarios' (Pueden ver a los empleados de su mismo negocio)
CREATE POLICY "Ver usuarios de su negocio" ON usuarios FOR SELECT
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Los admin pueden gestionar usuarios" ON usuarios FOR ALL
USING (
  tenant_id = get_user_tenant_id() AND 
  (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('owner', 'admin')
);

-- 4. Macro Política General para Tablas Operativas (Ingredientes, Productos, Recetas, etc.)
-- Como todas tienen 'tenant_id', podemos aplicar políticas universales.

DO $$$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
      AND t.table_name IN (
        'sucursales', 
        'categorias_ingredientes', 
        'ingredientes', 
        'categorias_productos', 
        'productos', 
        'recetas'
      )
  LOOP
    EXECUTE format('CREATE POLICY "Aislamiento total por tenant ALL" ON %I FOR ALL USING (tenant_id = get_user_tenant_id()) WITH CHECK (tenant_id = get_user_tenant_id());', table_name);
  END LOOP;
END;
$$$;

-- 5. Políticas para 'receta_items' (No tienen tenant_id directo, heredan de 'recetas')
CREATE POLICY "Ver items de sus propias recetas" ON receta_items FOR ALL
USING (
  receta_id IN (SELECT id FROM recetas WHERE tenant_id = get_user_tenant_id())
)
WITH CHECK (
  receta_id IN (SELECT id FROM recetas WHERE tenant_id = get_user_tenant_id())
);

