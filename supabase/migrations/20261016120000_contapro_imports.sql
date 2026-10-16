-- ==========================================================
-- Kelly's Cake · FoodOS
-- Vinculo con sistema contable (Contapro / Concar):
-- importacion de compras y ventas por mes o rango de meses
-- para el calculo de rentabilidad y KPIs reales.
-- ----------------------------------------------------------
-- Aplicar con: npx supabase db push
-- ==========================================================

CREATE TABLE IF NOT EXISTS contapro_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  archivo_nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('compras', 'ventas')),
  periodo_desde DATE NOT NULL,
  periodo_hasta DATE NOT NULL,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  igv NUMERIC(12,2) NOT NULL DEFAULT 0,
  filas INTEGER NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contapro_movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES contapro_imports(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compras', 'ventas')),
  fecha DATE NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio INTEGER NOT NULL,
  documento TEXT,
  tercero TEXT,
  ruc TEXT,
  subtotal NUMERIC(12,2),
  igv NUMERIC(12,2),
  total NUMERIC(12,2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'PEN',
  detalle TEXT,
  raw JSONB
);

CREATE INDEX IF NOT EXISTS idx_contapro_imports_tenant
  ON public.contapro_imports (tenant_id, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_contapro_movimientos_periodo
  ON public.contapro_movimientos (tenant_id, tipo, anio, mes);

-- Seguridad: mismo patron de aislamiento por tenant que el resto de FoodOS
ALTER TABLE public.contapro_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contapro_movimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento por tenant contapro_imports" ON public.contapro_imports;
CREATE POLICY "Aislamiento por tenant contapro_imports"
  ON public.contapro_imports FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant contapro_movimientos" ON public.contapro_movimientos;
CREATE POLICY "Aislamiento por tenant contapro_movimientos"
  ON public.contapro_movimientos FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

GRANT ALL ON public.contapro_imports TO authenticated;
GRANT ALL ON public.contapro_movimientos TO authenticated;

NOTIFY pgrst, 'reload schema';
