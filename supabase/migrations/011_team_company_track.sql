-- Team picks one company track at Pos 1 (case study + paired innovation card at Pos 3).

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS company_track TEXT
  CHECK (
    company_track IS NULL
    OR company_track IN ('tesla', 'netflix', 'openai', 'uniqlo', 'ron88')
  );

CREATE INDEX IF NOT EXISTS teams_company_track_idx ON public.teams(company_track)
  WHERE company_track IS NOT NULL;
