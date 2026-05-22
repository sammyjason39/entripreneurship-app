-- Participant login: student ID + phone (password). Admin can adjust team balances.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS whatsapp_normalized TEXT;

CREATE INDEX IF NOT EXISTS profiles_student_id_idx ON public.profiles(student_id)
  WHERE student_id IS NOT NULL;
