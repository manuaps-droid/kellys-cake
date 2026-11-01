-- ================================================================
-- MIGRACIÓN: Módulo de Predicción de Demanda (foodOS Predictivo)
-- Fase 1: Tablas base de predicción, supuestos de demanda y máquinas
-- ⚠️ Script de reverso: supabase/rollback/20261031010000_prediccion_demanda.sql
-- ================================================================

-- Tabla: vending_maquinas (agnóstico al formato: pantalla_tactil | vidrio_exhibicion)
CREATE TABLE IF NOT EXISTS vending_maquinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  ubicacion VARCHAR(200) NOT NULL,
  tipo_ubicacion VARCHAR(50), -- clinica | universidad | oficina | otro
  formato VARCHAR(30) NOT NULL DEFAULT 'pantalla_tactil', -- pantalla_tactil | vidrio_exhibicion
  capacidad_slots INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: foodos_supuestos_demanda (cold start - supuestos iniciales)
CREATE TABLE IF NOT EXISTS foodos_supuestos_demanda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES foodos_productos(id) ON DELETE CASCADE,
  maquina_id UUID REFERENCES vending_maquinas(id) ON DELETE SET NULL,
  unidades_base INTEGER NOT NULL DEFAULT 0,
  dia_semana SMALLINT, -- 0-6 o NULL = todos los días
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla: foodos_predicciones (pronósticos guardados con evaluación)
CREATE TABLE IF NOT EXISTS foodos_predicciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES foodos_productos(id) ON DELETE CASCADE,
  maquina_id UUID REFERENCES vending_maquinas(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  origen VARCHAR(20) NOT NULL DEFAULT 'supuesto', -- supuesto | estadistico
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
CREATE INDEX IF NOT EXISTS idx_maquinas_tenant_activo ON vending_maquinas(tenant_id, activo);

-- RLS policies
ALTER TABLE vending_maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_supuestos_demanda ENABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_predicciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento por tenant vending_maquinas" ON vending_maquinas;
CREATE POLICY "Aislamiento por tenant vending_maquinas"
  ON vending_maquinas FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_supuestos_demanda" ON foodos_supuestos_demanda;
CREATE POLICY "Aislamiento por tenant foodos_supuestos_demanda"
  ON foodos_supuestos_demanda FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_predicciones" ON foodos_predicciones;
CREATE POLICY "Aislamiento por tenant foodos_predicciones"
  ON foodos_predicciones FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

GRANT ALL ON public.vending_maquinas, public.foodos_supuestos_demanda, public.foodos_predicciones TO authenticated, service_role;
