-- ================================================================
-- MIGRACIÓN: Vending Machines (FK-free — versión que funciona)
-- tenant_id/maquina_id/producto_id son columnas planas sin FK.
-- Re-ejecutable.
-- ================================================================

-- 1. TABLA: Máquinas vending
CREATE TABLE IF NOT EXISTS vending_maquinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    tipo_ubicacion VARCHAR(50),
    formato VARCHAR(30) NOT NULL DEFAULT 'pantalla_tactil',
    capacidad_slots INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: Inventario de máquinas
CREATE TABLE IF NOT EXISTS vending_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maquina_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad_inicial INTEGER NOT NULL DEFAULT 0,
    cantidad_actual INTEGER NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
    costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA: Ventas de máquinas
CREATE TABLE IF NOT EXISTS vending_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maquina_id UUID NOT NULL,
    producto_id UUID NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_venta TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vending_maquinas_activo ON vending_maquinas(activo);
CREATE INDEX IF NOT EXISTS idx_vending_inventario_maquina ON vending_inventario(maquina_id);
CREATE INDEX IF NOT EXISTS idx_vending_inventario_producto ON vending_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_vending_ventas_maquina ON vending_ventas(maquina_id);
CREATE INDEX IF NOT EXISTS idx_vending_ventas_fecha ON vending_ventas(fecha_venta);

NOTIFY pgrst, 'reload schema';
