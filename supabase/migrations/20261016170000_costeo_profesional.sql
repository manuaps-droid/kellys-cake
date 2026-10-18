-- ==========================================================
-- Kelly's Cake · FoodOS
-- Sistema profesional de costeo: empaques, historial de
-- precios, mano de obra directa, costos fijos configurables
-- y margen objetivo por categoría.
--
-- Aplicar con: npx supabase db push (o SQL Editor)
-- ==========================================================

-- 1. COMPONENTES DE EMPAQUE POR PRODUCTO
-- Cada producto puede tener componentes de empaque con
-- cantidad y costo unitario. Se actualizan desde el admin.
CREATE TABLE IF NOT EXISTS foodos_empaques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES foodos_productos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,          -- Caja, Sticker, Base, Lazo
  cantidad DECIMAL(10,3) NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(10,4) NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HISTORIAL DE PRECIOS DE INGREDIENTES (trazabilidad)
-- Cada compra/factura actualiza el historial con fecha,
-- proveedor, referencia, precio y factor de conversión.
CREATE TABLE IF NOT EXISTS foodos_precio_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ingrediente_id UUID NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor VARCHAR(200),
  referencia VARCHAR(200),               -- Nº factura, boleta
  unidad_compra VARCHAR(20) NOT NULL,
  factor_conversion DECIMAL(10,4) NOT NULL DEFAULT 1000,
  costo_unitario DECIMAL(10,4) NOT NULL, -- Precio por unidad de compra
  cantidad_comprada DECIMAL(10,3),
  fuente VARCHAR(20) DEFAULT 'manual',   -- manual | ocr | contapro
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MANO DE OBRA DIRECTA POR PRODUCTO
-- Minutos activos por lote/producto, separando fases.
CREATE TABLE IF NOT EXISTS foodos_mano_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES foodos_productos(id) ON DELETE CASCADE,
  fase VARCHAR(30) NOT NULL DEFAULT 'preparacion', -- preparacion | decoracion | acabado | limpieza
  minutos_activos DECIMAL(8,2) NOT NULL DEFAULT 0,
  minutos_pasivos DECIMAL(8,2) NOT NULL DEFAULT 0,  -- Horno, refrigeración (no se cobra capacidad)
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CONFIGURACIÓN DE COSTOS FIJOS MENSUALES
-- Editable desde el admin, sustituye los defaults hardcoded.
CREATE TABLE IF NOT EXISTS foodos_costos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  concepto VARCHAR(100) NOT NULL,
  monto_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo VARCHAR(20) DEFAULT 'fijo',       -- fijo | variable_mensual
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MARGEN OBJETIVO POR CATEGORÍA DE PRODUCTO
-- Configurable desde el admin, sustituye el selector del simulador.
CREATE TABLE IF NOT EXISTS foodos_margenes_objetivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL,
  margen_objetivo DECIMAL(5,2) NOT NULL DEFAULT 70,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empaques_producto ON public.foodos_empaques(producto_id);
CREATE INDEX IF NOT EXISTS idx_precio_historial_ing ON public.foodos_precio_historial(ingrediente_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_mano_obra_producto ON public.foodos_mano_obra(producto_id);
CREATE INDEX IF NOT EXISTS idx_costos_fijos_tenant ON public.foodos_costos_fijos(tenant_id);

-- RLS: solo el servidor (service_role) puede escribir,
-- los usuarios autenticados solo leen su tenant.
ALTER TABLE public.foodos_empaques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_precio_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_mano_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_costos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foodos_margenes_objetivo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_empaques" ON public.foodos_empaques;
CREATE POLICY "Aislamiento por tenant foodos_empaques"
  ON public.foodos_empaques FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_precio_historial" ON public.foodos_precio_historial;
CREATE POLICY "Aislamiento por tenant foodos_precio_historial"
  ON public.foodos_precio_historial FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_mano_obra" ON public.foodos_mano_obra;
CREATE POLICY "Aislamiento por tenant foodos_mano_obra"
  ON public.foodos_mano_obra FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_costos_fijos" ON public.foodos_costos_fijos;
CREATE POLICY "Aislamiento por tenant foodos_costos_fijos"
  ON public.foodos_costos_fijos FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_margenes_objetivo" ON public.foodos_margenes_objetivo;
CREATE POLICY "Aislamiento por tenant foodos_margenes_objetivo"
  ON public.foodos_margenes_objetivo FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

GRANT ALL ON public.foodos_empaques, public.foodos_precio_historial, public.foodos_mano_obra, public.foodos_costos_fijos, public.foodos_margenes_objetivo TO authenticated, service_role;

-- Semillas: margenes objetivo por categoría (estimación configurable)
INSERT INTO public.foodos_margenes_objetivo (tenant_id, categoria, margen_objetivo)
SELECT t.id, 'Tortas de Autor & Diseño', 75
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.foodos_margenes_objetivo m
  WHERE m.tenant_id = t.id AND m.categoria = 'Tortas de Autor & Diseño'
);

INSERT INTO public.foodos_margenes_objetivo (tenant_id, categoria, margen_objetivo)
SELECT t.id, 'Línea Saludable & Vegana', 70
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.foodos_margenes_objetivo m
  WHERE m.tenant_id = t.id AND m.categoria = 'Línea Saludable & Vegana'
);

INSERT INTO public.foodos_margenes_objetivo (tenant_id, categoria, margen_objetivo)
SELECT t.id, 'Pastelería Tradicional & Porciones', 60
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.foodos_margenes_objetivo m
  WHERE m.tenant_id = t.id AND m.categoria = 'Pastelería Tradicional & Porciones'
);

INSERT INTO public.foodos_margenes_objetivo (tenant_id, categoria, margen_objetivo)
SELECT t.id, 'Línea Pet Friendly', 70
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.foodos_margenes_objetivo m
  WHERE m.tenant_id = t.id AND m.categoria = 'Línea Pet Friendly'
);

INSERT INTO public.foodos_margenes_objetivo (tenant_id, categoria, margen_objetivo)
SELECT t.id, 'Catering & Bocaditos', 55
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.foodos_margenes_objetivo m
  WHERE m.tenant_id = t.id AND m.categoria = 'Catering & Bocaditos'
);

NOTIFY pgrst, 'reload schema';
