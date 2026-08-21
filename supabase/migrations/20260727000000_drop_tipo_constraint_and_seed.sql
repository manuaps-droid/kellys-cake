-- Eliminar el CHECK constraint en 'tipo' para permitir crear cualquier tipo de catálogo
ALTER TABLE catalogo_personalizacion
  DROP CONSTRAINT IF EXISTS catalogo_personalizacion_tipo_check;

-- Recrear el seed con los catálogos iniciales solicitados
-- Celebrations
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('celebration', 'Cumpleaños', 'Celebración de cumpleaños', 1, true),
  ('celebration', 'Matrimonio', 'Boda y celebraciones matrimoniales', 2, true),
  ('celebration', '15 Años', 'Quinceañera', 3, true),
  ('celebration', 'Baby Shower', 'Fiesta de bienvenida para bebé', 4, true),
  ('celebration', 'Aniversario', 'Celebración de aniversario', 5, true),
  ('celebration', 'Graduación', 'Ceremonia de graduación', 6, true),
  ('celebration', 'Bautizo', 'Ceremonia de bautizo', 7, true)
ON CONFLICT DO NOTHING;

-- Sabores
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('flavor', 'Chocolate', 'Bizcocho de chocolate', 1, true),
  ('flavor', 'Vainilla', 'Bizcocho de vainilla', 2, true),
  ('flavor', 'Red Velvet', 'Bizcocho red velvet', 3, true),
  ('flavor', 'Fresa', 'Bizcocho de fresa', 4, true),
  ('flavor', 'Limón', 'Bizcocho de limón', 5, true),
  ('flavor', 'Zanahoria', 'Bizcocho de zanahoria', 6, true)
ON CONFLICT DO NOTHING;

-- Rellenos
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('filling', 'Manjar', 'Manjar tradicional', 1, true),
  ('filling', 'Fudge', 'Fudge de chocolate', 2, true),
  ('filling', 'Ganache', 'Ganache de chocolate', 3, true),
  ('filling', 'Mermelada', 'Mermelada de frutas', 4, true),
  ('filling', 'Crema de avellana', 'Crema de avellana', 5, true)
ON CONFLICT DO NOTHING;

-- Coberturas
INSERT INTO catalogo_personalizacion (tipo, nombre, descripcion, orden, activo)
VALUES
  ('frosting', 'Buttercream', 'Buttercream tradicional', 1, true),
  ('frosting', 'Fondant', 'Fondant decorativo', 2, true),
  ('frosting', 'Chantilly', 'Crema chantilly', 3, true),
  ('frosting', 'Naked', 'Sin cobertura exterior', 4, true),
  ('frosting', 'Espejo', 'Cobertura tipo espejo', 5, true)
ON CONFLICT DO NOTHING;
