-- 4-member teams (CEO, CTO, CFO, CMO), race timers, auto EnCoin events, Pos 6 compete timer.

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS race_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS race_finished_at TIMESTAMPTZ;

-- Replace 6-role constraint with 4 roles
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_team_role_check;
ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_team_role_check
  CHECK (team_role IN ('CEO', 'CTO', 'CFO', 'CMO'));

CREATE TABLE IF NOT EXISTS public.team_economy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  event_code TEXT NOT NULL,
  station_number INTEGER,
  amount INTEGER NOT NULL,
  note TEXT NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, event_code)
);

ALTER TABLE public.team_economy_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_economy_events_select ON public.team_economy_events
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.team_compete_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  station_number INTEGER NOT NULL DEFAULT 6 CHECK (station_number = 6),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  elapsed_ms INTEGER,
  started_by UUID REFERENCES public.profiles(id),
  ended_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS team_compete_runs_team_idx ON public.team_compete_runs(team_id, started_at DESC);

ALTER TABLE public.team_compete_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_compete_runs_select ON public.team_compete_runs
  FOR SELECT TO authenticated USING (true);
