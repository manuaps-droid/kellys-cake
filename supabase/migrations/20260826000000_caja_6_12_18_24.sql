-- ==========================================================
-- Kelly's Cake — "Arma tu caja": producto contenedor
-- ----------------------------------------------------------
-- Crea el producto caja-personalizada (idempotente) con
-- presentaciones de 6 / 12 / 18 / 24 unidades. No depende de
-- un catálogo coffee_break activo (catalogo_id = NULL).
-- El admin puede editar nombres/precios desde el panel admin
-- (pestaña Presentaciones del producto).
-- ==========================================================

DO $$
DECLARE
  v_producto_id UUID;
BEGIN
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
      NULL, NULL, 'borrador', true, false
    )
    RETURNING id INTO v_producto_id;

    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    ) VALUES
      (v_producto_id, '6 und',   12.00, 1, true, false),
      (v_producto_id, '12 und',  22.00, 2, true, false),
      (v_producto_id, '18 und',  32.00, 3, true, false),
      (v_producto_id, '24 und',  42.00, 4, true, false);

    RAISE NOTICE 'Caja creada con 4 presentaciones (6/12/18/24).';
  ELSE
    -- Si el producto ya existe, eliminar presentaciones anteriores
    -- y recrear con los nuevos tamaños (para reemplazar 25/50/100)
    DELETE FROM public.producto_presentaciones
      WHERE producto_id = v_producto_id
        AND nombre IN ('25 und','50 und','100 und');

    INSERT INTO public.producto_presentaciones (
      producto_id, nombre, precio, orden, activo, predeterminada
    )
    SELECT v_producto_id, n.nombre, n.precio, n.orden, true, false
    FROM (
      VALUES
        ('6 und',   12.00, 1),
        ('12 und',  22.00, 2),
        ('18 und',  32.00, 3),
        ('24 und',  42.00, 4)
    ) AS n(nombre, precio, orden)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.producto_presentaciones
      WHERE producto_id = v_producto_id AND nombre = n.nombre
    );

    RAISE NOTICE 'Presentaciones de la caja actualizadas a 6/12/18/24.';
  END IF;
END $$;
