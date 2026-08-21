-- ==========================================================
-- Kelly's Cake
-- Escalabilidad: índices faltantes para soportar gran volumen
-- de pedidos, clientes, productos y carritos.
--
-- Todos los índices son NO UNIQUE y CONCURRENTLY-friendly:
-- se usan IF NOT EXISTS para que la migración sea idempotente.
-- ==========================================================

-- --------------------------------------------------------
-- pedidos: columnas más usadas en filtros/orden/JOINS
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id
  ON public.pedidos (cliente_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado
  ON public.pedidos (estado);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago
  ON public.pedidos (estado_pago);

CREATE INDEX IF NOT EXISTS idx_pedidos_created_at
  ON public.pedidos (created_at DESC);

-- Concatenado: dashboard filtra estado + ordena por created_at
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_created_at
  ON public.pedidos (estado, created_at DESC);

-- --------------------------------------------------------
-- pedido_items: JOIN FK a pedidos (todo listado de admin)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id
  ON public.pedido_items (pedido_id);

CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id
  ON public.pedido_items (producto_id);

-- --------------------------------------------------------
-- carrito / carrito_items: alta frecuencia por cliente_id y carrito_id
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_carrito_cliente_id
  ON public.carrito (cliente_id);

CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito_id
  ON public.carrito_items (carrito_id);

-- Búsqueda de "item existente" en addToCart: .eq("carrito_id").eq("producto_id").maybeSingle()
-- Composite UNIQUE evita duplicados incluso ante concurrencia y sirve como índice cubridor.
-- Nota: si_existe duplicates previos, la migración lanzará error; en ese caso, ejecutar
-- un cleanup previo (DELETE duplicados por carrito_id+producto_id+cotizacion_id).
CREATE UNIQUE INDEX IF NOT EXISTS uq_carrito_items_carrito_producto_cotizacion
  ON public.carrito_items (carrito_id, producto_id, cotizacion_id);

CREATE INDEX IF NOT EXISTS idx_carrito_items_producto_id
  ON public.carrito_items (producto_id);

-- --------------------------------------------------------
-- clientes: lookup por user_id ya suele tener UNIQUE, pero
-- admin filtra por rol/activo; añadimos índices parciales
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clientes_rol_activo
  ON public.clientes (rol) WHERE activo = true;

-- --------------------------------------------------------
-- productos: filtros del storefront y admin
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_productos_slug
  ON public.productos (slug);

CREATE INDEX IF NOT EXISTS idx_productos_estado
  ON public.productos (estado);

CREATE INDEX IF NOT EXISTS idx_productos_catalogo_id
  ON public.productos (catalogo_id);

-- Catálogo público: WHERE estado='publicado' AND catalogo_id=...
CREATE INDEX IF NOT EXISTS idx_productos_catalogo_estado
  ON public.productos (catalogo_id, estado);

CREATE INDEX IF NOT EXISTS idx_productos_destacado
  ON public.productos (destacado) WHERE destacado = true;

CREATE INDEX IF NOT EXISTS idx_productos_mas_vendido
  ON public.productos (mas_vendido) WHERE mas_vendido = true;

-- --------------------------------------------------------
-- producto_imagenes: FK a producto (listado de galería)
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_id
  ON public.producto_imagenes (producto_id);

-- --------------------------------------------------------
-- cotizaciones: lookup por proyecto/catering
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cotizaciones_proyecto_id
  ON public.cotizaciones (proyecto_id);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_id
  ON public.cotizaciones (catering_id);

-- (token ya tiene UNIQUE que crea índice automático)

-- --------------------------------------------------------
-- cotizaciones_catering: lookup por proyecto_id
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_proyecto_id
  ON public.cotizaciones_catering (proyecto_id);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_catering_estado
  ON public.cotizaciones_catering (estado);

-- --------------------------------------------------------
-- proyectos_personalizados: filtros admin por estado
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_proyectos_estado_created_at
  ON public.proyectos_personalizados (estado, created_at DESC);

-- --------------------------------------------------------
-- contactos: leido/created_at para panel admin
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contactos_created_at
  ON public.contactos (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contactos_leido
  ON public.contactos (leido) WHERE leido = false;

-- --------------------------------------------------------
-- media: orden por created_at en el admin gallery
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_media_created_at
  ON public.media (created_at DESC);

NOTIFY pgrst, 'reload schema';
