-- ================================================================
-- MIGRACIÓN: Predicción de Demanda (tablas de supuestos y pronósticos)
-- FK-free: tenant_id es columna plana (la BD de despliegue puede no
-- tener tabla tenants). Re-ejecutable.
-- ================================================================

-- Tabla: foodos_supuestos_demanda (cold start - supuestos iniciales)
CREATE TABLE IF NOT EXISTS foodos_supuestos_demanda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  producto_id UUID NOT NULL,
  maquina_id UUID,
  unidades_base INTEGER NOT NULL DEFAULT 0,
  dia_semana SMALLINT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla: foodos_predicciones (pronósticos guardados con evaluación)
CREATE TABLE IF NOT EXISTS foodos_predicciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  producto_id UUID NOT NULL,
  maquina_id UUID,
  fecha DATE NOT NULL,
  origen VARCHAR(20) NOT NULL DEFAULT 'supuesto',
  unidades_bajas INTEGER,
  unidades_base INTEGER,
  unidades_altas INTEGER,
  ventas_reales INTEGER,
  mae NUMERIC,
  wape NUMERIC,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_predicciones_tenant_fecha ON foodos_predicciones(tenant_id, fecha);
CREATE INDEX IF NOT EXISTS idx_predicciones_producto_fecha ON foodos_predicciones(producto_id, fecha);
CREATE INDEX IF NOT EXISTS idx_supuestos_tenant_producto ON foodos_supuestos_demanda(tenant_id, producto_id);

NOTIFY pgrst, 'reload schema';
