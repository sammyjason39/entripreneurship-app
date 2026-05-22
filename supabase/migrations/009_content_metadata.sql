-- Structured case study / innovation card content (Vol. 2 booklet)
ALTER TABLE public.content
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS content_type_company_unique
  ON public.content (type, company);

COMMENT ON COLUMN public.content.metadata IS 'Profile, case study, and innovation sections from event PDF';
