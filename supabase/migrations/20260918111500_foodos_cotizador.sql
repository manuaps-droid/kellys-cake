-- ============================================
-- FOODOS AI - MÓDULO DE COTIZADOR DE EVENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cliente_nombre VARCHAR(255) NOT NULL,
  fecha_evento DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador',
  total_costo DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_venta > 0 AND total_costo >= 0
      THEN ((total_venta - total_costo) / total_venta) * 100
      ELSE 0 END
  ) STORED,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cotizacion_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  tipo_item VARCHAR(20) NOT NULL DEFAULT 'producto', -- 'producto' o 'extra'
  producto_id UUID REFERENCES productos(id),
  nombre_descripcion VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por tenant cotizaciones" ON cotizaciones FOR ALL 
USING (tenant_id = get_user_tenant_id()) 
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Items heredan de cotizaciones" ON cotizacion_items FOR ALL
USING (cotizacion_id IN (SELECT id FROM cotizaciones WHERE tenant_id = get_user_tenant_id()))
WITH CHECK (cotizacion_id IN (SELECT id FROM cotizaciones WHERE tenant_id = get_user_tenant_id()));
