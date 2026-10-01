-- ==========================================================
-- FOODOS: MÓDULO DE ALMACENES, INVENTARIOS Y KARDEX
-- ==========================================================

-- 1. TABLA DE ALMACENES FÍSICOS
CREATE TABLE IF NOT EXISTS foodos_almacenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  es_principal BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA DE STOCK ACTUAL POR ALMACÉN E INGREDIENTE
CREATE TABLE IF NOT EXISTS foodos_inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  almacen_id UUID NOT NULL REFERENCES foodos_almacenes(id) ON DELETE CASCADE,
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
  stock_actual DECIMAL(12,4) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(12,4) DEFAULT 5,
  ubicacion_estante VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(almacen_id, ingrediente_id)
);

-- 3. HISTORIAL DE MOVIMIENTOS (KARDEX AUDITABLE)
CREATE TABLE IF NOT EXISTS foodos_kardex (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  almacen_id UUID NOT NULL REFERENCES foodos_almacenes(id) ON DELETE CASCADE,
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
  tipo_movimiento VARCHAR(50) NOT NULL, -- 'COMPRA', 'PRODUCCION', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'MERMA'
  cantidad DECIMAL(12,4) NOT NULL,
  stock_anterior DECIMAL(12,4) NOT NULL,
  stock_posterior DECIMAL(12,4) NOT NULL,
  costo_unitario_momento DECIMAL(12,4),
  referencia_documento VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Desactivar RLS temporalmente
ALTER TABLE foodos_almacenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_kardex DISABLE ROW LEVEL SECURITY;

-- 4. INSERTAR ALMACÉN PRINCIPAL POR DEFECTO PARA CADA TENANT
DO $$
DECLARE
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN SELECT id FROM tenants LOOP
    IF NOT EXISTS (SELECT 1 FROM foodos_almacenes WHERE tenant_id = v_tenant.id) THEN
      INSERT INTO foodos_almacenes (tenant_id, nombre, descripcion, es_principal)
      VALUES (v_tenant.id, 'Almacén Principal (Secos y Producción)', 'Almacén general de insumos', true);
    END IF;
  END LOOP;
END $$;
