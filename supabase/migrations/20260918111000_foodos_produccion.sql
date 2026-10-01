-- ============================================
-- FOODOS AI - MÓDULO DE PRODUCCIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS ordenes_produccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fecha_prevista DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, completada, cancelada
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orden_produccion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes_produccion(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE ordenes_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_produccion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant ordenes" ON ordenes_produccion FOR ALL 
USING (tenant_id = get_user_tenant_id()) 
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Items heredan de ordenes" ON orden_produccion_items FOR ALL
USING (orden_id IN (SELECT id FROM ordenes_produccion WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (orden_id IN (SELECT id FROM ordenes_produccion WHERE tenant_id = get_user_tenant_id()));
