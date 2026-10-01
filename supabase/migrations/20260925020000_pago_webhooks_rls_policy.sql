-- ==========================================================
-- Kelly's Cake: Política RLS explícita para pago_webhooks
-- Resuelve advertencia Info: rls_enabled_no_policy (0008)
-- ==========================================================

DROP POLICY IF EXISTS "Admin gestiona pago_webhooks" ON public.pago_webhooks;

CREATE POLICY "Admin gestiona pago_webhooks"
  ON public.pago_webhooks
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT ALL ON public.pago_webhooks TO service_role;

NOTIFY pgrst, 'reload schema';
