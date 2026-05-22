-- Station QR check-in / crew checkout / team movement tracking

ALTER TABLE public.stations
  ADD COLUMN IF NOT EXISTS checkin_token TEXT UNIQUE;

UPDATE public.stations
SET checkin_token = 'st' || number || '_' || encode(gen_random_bytes(6), 'hex')
WHERE checkin_token IS NULL;

CREATE TABLE public.station_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One active visit per team at a time
CREATE UNIQUE INDEX station_visits_one_active_per_team
  ON public.station_visits(team_id)
  WHERE status = 'active';

CREATE INDEX station_visits_station_active_idx
  ON public.station_visits(station_id, status)
  WHERE status = 'active';

CREATE INDEX station_visits_team_checked_in_idx
  ON public.station_visits(team_id, checked_in_at DESC);

ALTER TABLE public.station_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY station_visits_select ON public.station_visits
  FOR SELECT TO authenticated
  USING (
    public.is_crew_or_admin()
    OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

CREATE POLICY station_visits_insert_member ON public.station_visits
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    AND checked_in_by = auth.uid()
    AND status = 'active'
  );

CREATE POLICY station_visits_update_crew ON public.station_visits
  FOR UPDATE TO authenticated
  USING (public.is_crew_or_admin())
  WITH CHECK (public.is_crew_or_admin());

GRANT ALL ON public.station_visits TO service_role;
