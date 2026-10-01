-- ==========================================================
-- FOODOS: CALCULADORA DE RENTABILIDAD POR EVENTO
-- ==========================================================

CREATE TABLE IF NOT EXISTS foodos_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  cliente VARCHAR(255),
  fecha_evento DATE,
  monto_cobrado DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado VARCHAR(30) DEFAULT 'activo',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS foodos_evento_gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES foodos_eventos(id) ON DELETE CASCADE,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL DEFAULT 0,
  categoria VARCHAR(100) DEFAULT 'general',
  es_tercerizado BOOLEAN DEFAULT false,
  fuente VARCHAR(50) DEFAULT 'manual',
  referencia_factura VARCHAR(100),
  ingrediente_id UUID REFERENCES ingredientes(id),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

ALTER TABLE foodos_eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_evento_gastos DISABLE ROW LEVEL SECURITY;
