-- ==========================================================
-- FOODOS: SISTEMA DE MÓDULOS + VENTAS Y FACTURACIÓN (SUNAT)
-- ==========================================================

-- 1. TABLA DE MÓDULOS ACTIVOS POR NEGOCIO
CREATE TABLE IF NOT EXISTS foodos_modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  modulo VARCHAR(50) NOT NULL, -- 'core', 'logistica', 'ventas'
  activo BOOLEAN DEFAULT false,
  fecha_activacion TIMESTAMPTZ DEFAULT now(),
  fecha_vencimiento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, modulo)
);

-- 2. TABLAS DE VENTAS Y COMPROBANTES (SUNAT)
CREATE TABLE IF NOT EXISTS foodos_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo_comprobante VARCHAR(20) NOT NULL DEFAULT 'boleta', -- 'boleta', 'factura', 'nota_venta'
  serie VARCHAR(10) NOT NULL DEFAULT 'B001',
  numero VARCHAR(20),
  cliente_tipo_doc VARCHAR(10) DEFAULT 'DNI', -- 'DNI', 'RUC', 'VARIOS'
  cliente_num_doc VARCHAR(20),
  cliente_nombre VARCHAR(255) NOT NULL DEFAULT 'CLIENTE GENERAL',
  cliente_direccion TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  igv DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'efectivo', -- 'efectivo', 'yape', 'plin', 'tarjeta', 'transferencia'
  estado VARCHAR(30) NOT NULL DEFAULT 'COMPLETADA', -- 'COMPLETADA', 'ANULADA'
  
  -- Campos específicos de integración SUNAT / Nubefact
  sunat_enviado BOOLEAN DEFAULT false,
  sunat_estado VARCHAR(50) DEFAULT 'PENDIENTE', -- 'ACEPTADO', 'RECHAZADO', 'PENDIENTE'
  sunat_respuesta_codigo VARCHAR(50),
  sunat_respuesta_descripcion TEXT,
  enlace_pdf TEXT,
  enlace_xml TEXT,
  enlace_cdr TEXT,
  cadena_para_codigo_qr TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS foodos_venta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID NOT NULL REFERENCES foodos_ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES foodos_productos(id) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  costo_unitario DECIMAL(10,4) DEFAULT 0, -- Para calcular rentabilidad exacta de la venta
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

ALTER TABLE foodos_modulos DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_venta_items DISABLE ROW LEVEL SECURITY;

-- 3. ACTIVAR MÓDULO CORE Y DEJAR LISTOS LOS DEMÁS PARA CADA TENANT
DO $$
DECLARE
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN SELECT id FROM tenants LOOP
    INSERT INTO foodos_modulos (tenant_id, modulo, activo)
    VALUES 
      (v_tenant.id, 'core', true),
      (v_tenant.id, 'logistica', true),
      (v_tenant.id, 'ventas', true)
    ON CONFLICT (tenant_id, modulo) DO NOTHING;
  END LOOP;
END $$;
