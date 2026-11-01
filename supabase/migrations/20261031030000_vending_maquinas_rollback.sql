-- ================================================================
-- ROLLBACK: vending_maquinas y tablas relacionadas
-- Fecha: 2026-10-31
-- ================================================================

DROP POLICY IF EXISTS "Aislamiento por tenant vending_ventas" ON vending_ventas;
DROP POLICY IF EXISTS "Aislamiento por tenant vending_inventario" ON vending_inventario;
DROP POLICY IF EXISTS "Aislamiento por tenant vending_maquinas" ON vending_maquinas;

ALTER TABLE vending_ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE vending_inventario DISABLE ROW LEVEL SECURITY;
ALTER TABLE vending_maquinas DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS vending_ventas CASCADE;
DROP TABLE IF EXISTS vending_inventario CASCADE;
DROP TABLE IF EXISTS vending_maquinas CASCADE;
