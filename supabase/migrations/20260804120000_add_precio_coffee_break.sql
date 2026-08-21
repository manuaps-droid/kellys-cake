-- Añade columna `precio` a catalogo_personalizacion (nullable, solo aplica a coffee_break)
ALTER TABLE public.catalogo_personalizacion
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10,2);

-- Crear catálogo "Coffee Break" tipo coffee_break + items de ejemplo con precios
-- Si ya existe el catálogo (según el usuario ya está creado) no se duplica.
INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo, precio)
SELECT 'coffee_break', 'Coffee Break', 'Opciones de coffee break con precio unitario', 1, true, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.catalogo_personalizacion WHERE tipo = 'coffee_break'
);

-- Items de coffee break (asumiendo que se pueden agregar como subitems con el mismo tipo)
-- Nota: El usuario indicó que ya tiene productos, así que insertarlos solo si el tipo coffee_break está vacío.
DO $$
DECLARE
  has_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO has_items FROM public.catalogo_personalizacion WHERE tipo = 'coffee_break' AND nombre <> 'Coffee Break';
  IF has_items = 0 THEN
    INSERT INTO public.catalogo_personalizacion (tipo, nombre, descripcion, orden, activo, precio) VALUES
      ('coffee_break', 'Sándwich triangulares', 'Sándwich surtidos en porciones triangulares (x10)', 1, true, 25.00),
      ('coffee_break', 'Miniaturas dulces', 'Selección de miniaturas dulces (x12)', 2, true, 30.00),
      ('coffee_break', 'Té & Café', 'Servicio de tés y café con leche', 3, true, 8.00),
      ('coffee_break', 'Jugos naturales', 'Jugos de frutas naturales (por vaso)', 4, true, 6.00),
      ('coffee_break', 'Estación de frutas', 'Estación de frutas de temporada', 5, true, 35.00),
      ('coffee_break', 'Queques individuales', 'Queques individuales variados (x6)', 6, true, 28.00);
  END IF;
END $$;

-- Permisos
GRANT UPDATE ON public.catalogo_personalizacion TO service_role;
GRANT SELECT ON public.catalogo_personalizacion TO anon;
GRANT SELECT ON public.catalogo_personalizacion TO authenticated;
