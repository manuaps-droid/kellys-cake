-- ================================================================
-- MIGRACIÓN: 20261031020000_vending_maquinas.sql
-- Tablas: vending_maquinas
-- Fecha: 2026-10-31
-- ================================================================

CREATE TABLE IF NOT EXISTS vending_maquinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  tipo_ubicacion VARCHAR(100),
  formato VARCHAR(50),
  capacidad_slots INTEGER NOT NULL DEFAULT 10,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vending_maquinas_nombre ON vending_maquinas(nombre);
CREATE INDEX IF NOT EXISTS idx_vending_maquinas_ubicacion ON vending_maquinas(ubicacion);

-- RLS
ALTER TABLE vending_maquinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento por tenant vending_maquinas" ON vending_maquinas;
CREATE POLICY "Aislamiento por tenant vending_maquinas"
  ON vending_maquinas FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

GRANT ALL ON vending_maquinas TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
