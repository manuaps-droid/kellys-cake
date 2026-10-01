-- ==========================================================
-- Kelly's Cake
-- "Arma tu caja de bocaditos"
-- ----------------------------------------------------------
-- Crea un producto contenedor OCULTO de la tienda (estado
-- 'borrador') cuyas PRESENTACIONES definen los tamaños y
-- precios de la caja personalizada. El admin puede editar
-- tamaños/precios desde la pestaña Presentaciones del admin.
-- ==========================================================

DO $$
DECLARE
  v_producto_id UUID;
  v_catalogo_id UUID;
BEGIN
  -- Primer catálogo coffee_break activo (para cumplir la FK)
  SELECT id INTO v_catalogo_id
    FROM public.catalogo_personalizacion
    WHERE tipo = 'coffee_break' AND activo = true
    ORDER BY orden
    LIMIT 1;

  IF v_catalogo_id IS NULL THEN
    RAISE NOTICE 'No hay catálogo coffee_break activo; no se creó la caja.';
    RETURN;
  END IF;

  SELECT id INTO v_producto_id
    FROM public.productos
    WHERE slug = 'caja-personalizada'
    LIMIT 1;

  IF v_producto_id IS NULL THEN
    INSERT INTO public.productos (
      nombre, slug,
      descripcion_corta, descripcion,
      precio, catalogo_id, estado, disponible, mas_vendido
    ) VALUES (
      'Caja de bocaditos personalizada',
      'caja-personalizada',
      'Arma tu caja eligiendo tamaño y sabores.',
      'Caja personalizada de bocaditos dulces y salados. Elige el tamaño y distribuye las unidades entre tus sabores favoritos.',
      NULL, v_catalogo_id, 'borrador', true, false
    )
    RETURNING id INTO v_producto_id;

    -- Tamaños iniciales (editables desde el admin)
    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    ) VALUES
      (v_producto_id, '25 und',  40.00, 1, true, false),
      (v_producto_id, '50 und',  75.00, 2, true, false),
      (v_producto_id, '100 und', 140.00, 3, true, false);

    RAISE NOTICE 'Producto caja-personalizada creado con 3 presentaciones.';
  ELSE
    RAISE NOTICE 'El producto caja-personalizada ya existe.';
  END IF;
END $$;
