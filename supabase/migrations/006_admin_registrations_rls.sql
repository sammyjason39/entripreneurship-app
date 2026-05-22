-- Allow super admins to manage event_registrations from the jury console (client + API)

CREATE POLICY event_registrations_admin_select ON public.event_registrations
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY event_registrations_admin_insert ON public.event_registrations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY event_registrations_admin_update ON public.event_registrations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY event_registrations_admin_delete ON public.event_registrations
  FOR DELETE TO authenticated
  USING (public.is_admin());
