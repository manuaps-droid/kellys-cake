-- ================================================================
-- ROLLBACK: 20261031010000_prediccion_demanda.sql
-- Elimina tablas creadas por la migración de Predicción de Demanda
-- ================================================================

DROP POLICY IF EXISTS "Aislamiento por tenant foodos_predicciones" ON foodos_predicciones;
DROP POLICY IF EXISTS "Aislamiento por tenant foodos_supuestos_demanda" ON foodos_supuestos_demanda;
DROP POLICY IF EXISTS "Aislamiento por tenant vending_maquinas" ON vending_maquinas;

ALTER TABLE foodos_predicciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE foodos_supuestos_demanda DISABLE ROW LEVEL SECURITY;
ALTER TABLE vending_maquinas DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS foodos_predicciones CASCADE;
DROP TABLE IF EXISTS foodos_supuestos_demanda CASCADE;
DROP TABLE IF EXISTS vending_maquinas CASCADE;
