-- Pre-registered participants (imported from Microsoft Forms CSV) + WhatsApp OTP login

CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_normalized TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT,
  study_program TEXT,
  email TEXT,
  form_email TEXT,
  commit_attendance TEXT,
  interests TEXT,
  info_source TEXT,
  referral_name TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX event_registrations_user_id_idx ON public.event_registrations(user_id);

CREATE TABLE public.whatsapp_login_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  whatsapp_normalized TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'expired', 'consumed')),
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX whatsapp_login_challenges_lookup_idx
  ON public.whatsapp_login_challenges(whatsapp_normalized, code, status);

CREATE INDEX whatsapp_login_challenges_pending_idx
  ON public.whatsapp_login_challenges(id, status) WHERE status IN ('pending', 'confirmed');

-- Service role / server API only (no client RLS policies)
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_login_challenges ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.event_registrations TO service_role;
GRANT ALL ON public.whatsapp_login_challenges TO service_role;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_normalized TEXT UNIQUE;
