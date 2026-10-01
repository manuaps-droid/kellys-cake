-- ==========================================================
-- REWARDS Y FIDELIZACIÓN
-- ==========================================================

-- ==========================================================
-- 1. Table `rewards_niveles`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_niveles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '🌱',
  puntos_minimos INTEGER NOT NULL DEFAULT 0,
  descuento_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  delivery_gratis_umbral NUMERIC(10,2),  -- NULL = no aplica, 0 = gratis siempre
  beneficios JSONB NOT NULL DEFAULT '[]'::jsonb,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed 4 levels
INSERT INTO public.rewards_niveles (nombre, slug, emoji, puntos_minimos, descuento_pct, delivery_gratis_umbral, beneficios, orden)
VALUES 
  ('Semilla', 'semilla', '🌱', 0, 0, NULL, '["Acceso a ofertas exclusivas", "Newsletter VIP"]'::jsonb, 0),
  ('Flor', 'flor', '🌸', 100, 5, 150, '["5% descuento permanente", "Degustación gratis en pedidos +S/150", "Acceso anticipado a nuevos diseños"]'::jsonb, 1),
  ('Torta', 'torta', '🎂', 300, 10, 100, '["10% descuento", "Delivery gratis en pedidos +S/100", "Personalización premium sin cargo", "Atención prioritaria"]'::jsonb, 2),
  ('Corona', 'corona', '👑', 600, 15, 0, '["15% descuento", "Delivery gratis siempre", "Torta sorpresa en tu cumpleaños", "Invitación a eventos exclusivos"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- 2. Table `rewards_puntos`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_puntos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL UNIQUE REFERENCES public.clientes(id) ON DELETE CASCADE,
  puntos_totales INTEGER NOT NULL DEFAULT 0,
  puntos_disponibles INTEGER NOT NULL DEFAULT 0,
  nivel_id UUID REFERENCES public.rewards_niveles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 3. Table `rewards_transacciones`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.rewards_transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ganancia', 'canje')),
  cantidad INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  referencia_id UUID,
  referencia_tipo TEXT,  -- 'pedido', 'resena', 'referido', 'registro', 'canje', 'bonus'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 4. Table `referidos`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  referido_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  codigo TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'registrado', 'completado', 'expirado')),
  recompensa_referente INTEGER NOT NULL DEFAULT 30,  -- puntos
  recompensa_referido NUMERIC(5,2) NOT NULL DEFAULT 10, -- % descuento primera compra
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completado_at TIMESTAMPTZ
);

-- ==========================================================
-- 5. Table `fechas_especiales`
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.fechas_especiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('cumpleanos', 'aniversario_boda', 'cumpleanos_hijo', 'otro')),
  nombre_relacion TEXT,
  fecha DATE NOT NULL,
  notificado_este_ano BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 6. RPC Function `award_points`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.award_points(
  p_cliente_id UUID,
  p_cantidad INTEGER,
  p_motivo TEXT,
  p_ref_id UUID DEFAULT NULL,
  p_ref_tipo TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nuevo_total INTEGER;
  v_nuevo_disponible INTEGER;
  v_nuevo_nivel_id UUID;
  v_nivel_nombre TEXT;
BEGIN
  -- Insert or update rewards_puntos
  INSERT INTO public.rewards_puntos (cliente_id, puntos_totales, puntos_disponibles)
  VALUES (p_cliente_id, p_cantidad, p_cantidad)
  ON CONFLICT (cliente_id) DO UPDATE
  SET puntos_totales = rewards_puntos.puntos_totales + p_cantidad,
      puntos_disponibles = rewards_puntos.puntos_disponibles + p_cantidad,
      updated_at = now();

  -- Get new totals
  SELECT puntos_totales, puntos_disponibles INTO v_nuevo_total, v_nuevo_disponible
  FROM public.rewards_puntos WHERE cliente_id = p_cliente_id;

  -- Recalculate level based on total points
  SELECT id, nombre INTO v_nuevo_nivel_id, v_nivel_nombre
  FROM public.rewards_niveles
  WHERE puntos_minimos <= v_nuevo_total
  ORDER BY puntos_minimos DESC
  LIMIT 1;

  -- Update level
  UPDATE public.rewards_puntos
  SET nivel_id = v_nuevo_nivel_id
  WHERE cliente_id = p_cliente_id;

  -- Record transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo, referencia_id, referencia_tipo)
  VALUES (p_cliente_id, 'ganancia', p_cantidad, p_motivo, p_ref_id, p_ref_tipo);

  RETURN jsonb_build_object(
    'success', true,
    'puntos_totales', v_nuevo_total,
    'puntos_disponibles', v_nuevo_disponible,
    'nivel', v_nivel_nombre
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==========================================================
-- 7. RPC Function `redeem_points`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.redeem_points(
  p_cliente_id UUID,
  p_cantidad INTEGER,
  p_motivo TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_disponibles INTEGER;
  v_nuevo_disponible INTEGER;
BEGIN
  -- Check available points
  SELECT puntos_disponibles INTO v_disponibles
  FROM public.rewards_puntos
  WHERE cliente_id = p_cliente_id;

  IF v_disponibles IS NULL OR v_disponibles < p_cantidad THEN
    RETURN jsonb_build_object('success', false, 'error', 'Puntos insuficientes.');
  END IF;

  -- Deduct points
  UPDATE public.rewards_puntos
  SET puntos_disponibles = puntos_disponibles - p_cantidad,
      updated_at = now()
  WHERE cliente_id = p_cliente_id;

  v_nuevo_disponible := v_disponibles - p_cantidad;

  -- Record transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo)
  VALUES (p_cliente_id, 'canje', p_cantidad, p_motivo);

  RETURN jsonb_build_object(
    'success', true,
    'puntos_disponibles', v_nuevo_disponible
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ==========================================================
-- 8. Modify trigger `handle_new_user`
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente_id UUID;
  v_nivel_semilla UUID;
BEGIN
  INSERT INTO public.clientes (user_id, nombre, apellidos, correo, celular, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', trim(both ' ' from replace(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), ''))),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'celular', ''),
    'cliente',
    true
  )
  RETURNING id INTO v_cliente_id;

  -- Get the starting level (Semilla)
  SELECT id INTO v_nivel_semilla
  FROM public.rewards_niveles
  WHERE slug = 'semilla'
  LIMIT 1;

  -- Create rewards row with 20 welcome points
  INSERT INTO public.rewards_puntos (cliente_id, puntos_totales, puntos_disponibles, nivel_id)
  VALUES (v_cliente_id, 20, 20, v_nivel_semilla);

  -- Record the welcome bonus transaction
  INSERT INTO public.rewards_transacciones (cliente_id, tipo, cantidad, motivo, referencia_tipo)
  VALUES (v_cliente_id, 'ganancia', 20, 'Bienvenida a Kelly''s Cake 🎂', 'registro');

  RETURN NEW;
END;
$$;

-- ==========================================================
-- 9. Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_rewards_puntos_cliente ON public.rewards_puntos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_rewards_puntos_nivel ON public.rewards_puntos (nivel_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transacciones_cliente ON public.rewards_transacciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transacciones_created ON public.rewards_transacciones (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referidos_referente ON public.referidos (referente_id);
CREATE INDEX IF NOT EXISTS idx_referidos_codigo ON public.referidos (codigo);
CREATE INDEX IF NOT EXISTS idx_referidos_referido ON public.referidos (referido_id);
CREATE INDEX IF NOT EXISTS idx_fechas_especiales_cliente ON public.fechas_especiales (cliente_id);
CREATE INDEX IF NOT EXISTS idx_fechas_especiales_fecha ON public.fechas_especiales (fecha);

-- ==========================================================
-- 10. RLS
-- ==========================================================
-- Disable RLS on all new tables since auth is handled in code via getCurrentClient/getCurrentAdmin
ALTER TABLE public.rewards_niveles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_puntos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_transacciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fechas_especiales DISABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 11. GRANT permissions
-- ==========================================================
GRANT ALL ON public.rewards_niveles TO service_role;
GRANT SELECT ON public.rewards_niveles TO anon, authenticated;

GRANT ALL ON public.rewards_puntos TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.rewards_puntos TO authenticated;

GRANT ALL ON public.rewards_transacciones TO service_role;
GRANT SELECT, INSERT ON public.rewards_transacciones TO authenticated;

GRANT ALL ON public.referidos TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.referidos TO authenticated;

GRANT ALL ON public.fechas_especiales TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fechas_especiales TO authenticated;

REVOKE EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points(UUID, INTEGER, TEXT, UUID, TEXT) TO service_role, authenticated;

REVOKE EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_points(UUID, INTEGER, TEXT) TO service_role, authenticated;

-- ==========================================================
-- 12. Schema reload
-- ==========================================================
NOTIFY pgrst, 'reload schema';
