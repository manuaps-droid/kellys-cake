-- ================================================================
-- MIGRACIÓN: 20261031030001_vending_ventas.sql
-- Tabla: vending_ventas
-- Fecha: 2026-10-31
-- ================================================================

CREATE TABLE IF NOT EXISTS vending_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquina_id UUID NOT NULL REFERENCES vending_maquinas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_venta TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vending_ventas_maquina ON vending_ventas(maquina_id);
CREATE INDEX IF NOT EXISTS idx_vending_ventas_producto ON vending_ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_vending_ventas_fecha ON vending_ventas(fecha_venta);

-- RLS
ALTER TABLE vending_ventas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento por tenant vending_ventas" ON vending_ventas;
CREATE POLICY "Aislamiento por tenant vending_ventas"
  ON vending_ventas FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

GRANT ALL ON vending_ventas TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
