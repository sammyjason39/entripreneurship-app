-- Super admin / jury: crew assignments and admin helpers

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND app_role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE TABLE public.crew_assignments (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_label TEXT NOT NULL,
  assignment_kind TEXT NOT NULL DEFAULT 'general'
    CHECK (assignment_kind IN (
      'jury',
      'station',
      'bank',
      'registration',
      'roaming',
      'general'
    )),
  station_id UUID REFERENCES public.stations(id) ON DELETE SET NULL,
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX crew_assignments_station_id_idx ON public.crew_assignments(station_id);

ALTER TABLE public.crew_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY crew_assignments_select ON public.crew_assignments
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR public.is_crew_or_admin()
  );

CREATE POLICY crew_assignments_admin_write ON public.crew_assignments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins may update profiles (promote/demote crew, names)
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
