-- ==========================================================
-- Kelly's Cake
-- Escalabilidad + consistencia: creación atómica de pedidos
-- + idempotencia de webhooks de pago.
--
-- 1) Tabla `pago_webhooks`: registra notificaciones de pago
--    (MercadoPago/Culqi) y permite procesar cada evento una
--    sola vez (clave única `external_reference`).
--
-- 2) Función `create_order(p_payload jsonb)` PL/pgSQL: inserta
--    pedidos + pedido_items + elimina carrito_items consumidos
--    + archiva la solicitud origen (cotizacion/catering/proyecto)
--    en una sola transacción, con idempotencia por
--    `idempotency_key` y por `payment_reference`.
-- ==========================================================

-- --------------------------------------------------------
-- 1) Tabla de webhooks de pago (idempotencia)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pago_webhooks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  procesado       BOOLEAN NOT NULL DEFAULT false,
  fuente          TEXT NOT NULL,                      -- 'mercadopago' | 'culqi'
  external_reference TEXT,                            -- id de pago del proveedor
  topic           TEXT,                               -- 'payment' | 'merchant_order'
  payment_id      TEXT,                               -- id del pago en MP
  status          TEXT,                               -- status retornado por la API
  raw             JSONB,                              -- payload completo
  pedido_id       UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  CONSTRAINT uq_pago_webhooks_fuente_external UNIQUE (fuente, external_reference)
);

CREATE INDEX IF NOT EXISTS idx_pago_webhooks_procesado
  ON public.pago_webhooks (procesado) WHERE procesado = false;

CREATE INDEX IF NOT EXISTS idx_pago_webhooks_pedido_id
  ON public.pago_webhooks (pedido_id);

-- RLS: solo service_role puede leer/escribir (es admin-only).
ALTER TABLE public.pago_webhooks ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 2) Función create_order atómica
-- --------------------------------------------------------
-- Acepta un JSON con:
--   cliente_id, subtotal, envio, total,
--   metodo_pago, referencia_pago, estado_pago, tipo_pago, monto_pagado,
--   cotizacion_id, fecha_entrega, hora_entrega, tipo_entrega,
--   idempotency_key (opcional),
--   items: [{ carrito_item_id, producto_id, cantidad, precio,
--            nombre, descripcion, imagen }]
--
-- Devuelve: { pedido_id uuid, numero int, estado text, subtotal, envio, total }
-- ==========================================================

CREATE OR REPLACE FUNCTION public.create_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id       UUID        := (p_payload->>'cliente_id')::uuid;
  v_subtotal         NUMERIC(12,2) := COALESCE((p_payload->>'subtotal')::numeric, 0);
  v_envio            NUMERIC(12,2) := COALESCE((p_payload->>'envio')::numeric, 0);
  v_total            NUMERIC(12,2) := COALESCE((p_payload->>'total')::numeric, 0);
  v_metodo_pago      TEXT        := p_payload->>'metodo_pago';
  v_referencia_pago  TEXT        := p_payload->>'referencia_pago';
  v_estado_pago      TEXT        := COALESCE(p_payload->>'estado_pago', 'pendiente');
  v_tipo_pago        TEXT        := p_payload->>'tipo_pago';
  v_monto_pagado     NUMERIC(12,2) := (p_payload->>'monto_pagado')::numeric;
  v_cotizacion_id    UUID        := NULLIF(p_payload->>'cotizacion_id','')::uuid;
  v_fecha_entrega    DATE        := NULLIF(p_payload->>'fecha_entrega','')::date;
  v_hora_entrega     TIME        := NULLIF(p_payload->>'hora_entrega','')::time;
  v_tipo_entrega     TEXT        := NULLIF(p_payload->>'tipo_entrega','');
  v_idem_key         TEXT        := NULLIF(p_payload->>'idempotency_key','');

  v_items            JSONB       := p_payload->'items';
  v_pedido_id        UUID;
  v_numero           INTEGER;
  v_carrito_ids      UUID[]      := ARRAY[]::UUID[];
  v_existing         UUID;
  v_cat_catering_id  UUID;
  v_cat_proyecto_id  UUID;
  v_proy_hora        TIME;
  v_proy_tipo        TEXT;
BEGIN
  -- ==========================================================
  -- Idempotencia 1: por idempotency_key (cliente re-envía)
  -- ==========================================================
  IF v_idem_key IS NOT NULL THEN
    SELECT id INTO v_existing
      FROM public.pedidos
      WHERE referencia_pago = v_idem_key
        AND metodo_pago = v_metodo_pago
      LIMIT 1;

    IF v_existing IS NOT NULL THEN
      RETURN jsonb_build_object(
        'pedido_id', v_existing,
        'already_exists', true,
        'message', 'Pedido ya creado previamente.'
      );
    END IF;
  END IF;

  -- ==========================================================
  -- Validaciones básicas
  -- ==========================================================
  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'cliente_id es obligatorio';
  END IF;

  IF v_items IS NULL OR jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío.';
  END IF;

  -- ==========================================================
  -- Si hay cotización vinculada, leer datos de entrega si no
  -- llegaron en el payload (fallback a los de la cotización).
  -- ==========================================================
  IF v_cotizacion_id IS NOT NULL AND v_fecha_entrega IS NULL THEN
    SELECT c.fecha_evento, c.catering_id, c.proyecto_id
      INTO v_fecha_entrega, v_cat_catering_id, v_cat_proyecto_id
      FROM public.cotizaciones c
      WHERE c.id = v_cotizacion_id
      LIMIT 1;

    IF v_cat_proyecto_id IS NOT NULL AND v_hora_entrega IS NULL THEN
      SELECT p.hora_evento, p.tipo_entrega
        INTO v_proy_hora, v_proy_tipo
        FROM public.proyectos_personalizados p
        WHERE p.id = v_cat_proyecto_id
        LIMIT 1;

      v_hora_entrega := COALESCE(v_hora_entrega, v_proy_hora);
      v_tipo_entrega := COALESCE(v_tipo_entrega, v_proy_tipo);
    END IF;
  END IF;

  -- ==========================================================
  -- INSERT pedido (the .single())
  -- ==========================================================
  INSERT INTO public.pedidos (
    cliente_id, subtotal, envio, total,
    metodo_pago, referencia_pago, estado_pago,
    tipo_pago, monto_pagado,
    cotizacion_id,
    fecha_entrega, hora_entrega, tipo_entrega,
    estado
  ) VALUES (
    v_cliente_id, v_subtotal, v_envio, v_total,
    v_metodo_pago, COALESCE(v_referencia_pago, v_idem_key), v_estado_pago,
    v_tipo_pago,  v_monto_pagado,
    v_cotizacion_id,
    v_fecha_entrega, v_hora_entrega, v_tipo_entrega,
    'pendiente'
  )
  RETURNING id, numero INTO v_pedido_id, v_numero;

  -- ==========================================================
  -- INSERT pedido_items (batch insert)
  -- ==========================================================
  INSERT INTO public.pedido_items (
    pedido_id, producto_id, cantidad, precio,
    nombre, descripcion, imagen
  )
  SELECT
    v_pedido_id,
    NULLIF(el->>'producto_id','')::uuid,
    (el->>'cantidad')::integer,
    (el->>'precio')::numeric,
    el->>'nombre',
    el->>'descripcion',
    el->>'imagen'
  FROM jsonb_array_elements(v_items) AS el;

  -- ==========================================================
  -- Recolectar y eliminar los carrito_items consumidos
  -- ==========================================================
  SELECT array_agg(NULLIF(el->>'carrito_item_id','')::uuid) FILTER
         (WHERE el->>'carrito_item_id' IS NOT NULL)
    INTO v_carrito_ids
    FROM jsonb_array_elements(v_items) AS el;

  IF v_carrito_ids IS NOT NULL AND array_length(v_carrito_ids, 1) > 0 THEN
    DELETE FROM public.carrito_items
      WHERE id = ANY(v_carrito_ids);
  END IF;

  -- ==========================================================
  -- Archivar la solicitud origen solo si el pedido quedó pagado
  -- ==========================================================
  -- Archivar requiere leer nuevamente los ids si no vinieron por payload.
  IF v_cotizacion_id IS NOT NULL
     AND v_cat_catering_id IS NULL
     AND v_cat_proyecto_id IS NULL THEN
    SELECT c.catering_id, c.proyecto_id
      INTO v_cat_catering_id, v_cat_proyecto_id
      FROM public.cotizaciones c
      WHERE c.id = v_cotizacion_id
      LIMIT 1;
  END IF;

  IF v_cotizacion_id IS NOT NULL AND v_estado_pago = 'pagado' THEN
    -- catering
    IF v_cat_catering_id IS NOT NULL THEN
      UPDATE public.cotizaciones_catering
        SET estado = 'finalizado'
        WHERE id = v_cat_catering_id;
    END IF;

    -- proyecto personalizado
    IF v_cat_proyecto_id IS NOT NULL THEN
      UPDATE public.proyectos_personalizados
        SET estado = 'finalizado'
        WHERE id = v_cat_proyecto_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'pedido_id', v_pedido_id,
    'numero', v_numero,
    'estado', 'pendiente',
    'estado_pago', v_estado_pago,
    'subtotal', v_subtotal,
    'envio', v_envio,
    'total', v_total,
    'already_exists', false
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'create_order failed: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Permisos: solo service_role puede ejecutarla (los Server
-- Actions la invocan vía createAdminClient). El usuario anon
-- nunca debe invocarla directamente.
REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO service_role;

NOTIFY pgrst, 'reload schema';
