-- ============================================
-- FOODOS AI - MVP1: CORE Y COSTOS
-- ============================================

-- 1. CORE (Multi-tenancy + Usuarios)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ruc VARCHAR(11) UNIQUE,
  tipo_negocio VARCHAR(50) NOT NULL DEFAULT 'pasteleria',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  es_principal BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sucursal_id UUID REFERENCES sucursales(id),
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'viewer',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INGREDIENTES
CREATE TABLE IF NOT EXISTS categorias_ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_ingredientes(id),
  nombre VARCHAR(255) NOT NULL,
  unidad_compra VARCHAR(20) NOT NULL,
  unidad_uso VARCHAR(20) NOT NULL,
  factor_conversion DECIMAL(10,4) NOT NULL DEFAULT 1000,
  costo_unitario DECIMAL(10,4) NOT NULL DEFAULT 0,
  costo_por_unidad_uso DECIMAL(10,6) GENERATED ALWAYS AS (
    CASE WHEN factor_conversion > 0 THEN costo_unitario / factor_conversion ELSE 0 END
  ) STORED,
  porcentaje_rendimiento DECIMAL(5,2) DEFAULT 100,
  porcentaje_merma_estandar DECIMAL(5,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTOS Y RECETAS
CREATE TABLE IF NOT EXISTS categorias_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_productos(id),
  nombre VARCHAR(255) NOT NULL,
  precio_venta DECIMAL(10,2),
  precio_costo DECIMAL(10,4),
  margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN precio_venta > 0 AND precio_costo > 0
      THEN ((precio_venta - precio_costo) / precio_venta) * 100
      ELSE NULL END
  ) STORED,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) DEFAULT 'Receta Principal',
  rendimiento DECIMAL(10,2) NOT NULL DEFAULT 1,
  es_activa BOOLEAN DEFAULT true,
  costo_total DECIMAL(10,4) DEFAULT 0,
  costo_unitario DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes(id),
  sub_receta_id UUID REFERENCES recetas(id),
  cantidad DECIMAL(10,4) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  merma_porcentaje DECIMAL(5,2) DEFAULT 0,
  costo_linea DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receta_items ENABLE ROW LEVEL SECURITY;

-- Nota: Las políticas RLS específicas para cada tabla se definirán 
-- en un archivo de migración posterior para simplificar.
