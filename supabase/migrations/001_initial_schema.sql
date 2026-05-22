-- EnTripreneurship Vol. 02 — Initial Schema
-- Run in Supabase SQL Editor or via CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  app_role TEXT NOT NULL DEFAULT 'participant'
    CHECK (app_role IN ('participant', 'crew', 'admin')),
  pin_hash TEXT,
  qr_token TEXT UNIQUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  pin_failed_attempts INTEGER DEFAULT 0,
  pin_locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  ceo_id UUID NOT NULL REFERENCES public.profiles(id),
  join_code TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  business_idea TEXT,
  innovative_score INTEGER CHECK (innovative_score IS NULL OR (innovative_score BETWEEN 1 AND 10)),
  outfit_score INTEGER CHECK (outfit_score IS NULL OR (outfit_score BETWEEN 1 AND 10)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team membership
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL
    CHECK (team_role IN ('CEO', 'CTO', 'CFO', 'CMO', 'COO', 'CPO')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id),
  UNIQUE(team_id, team_role)
);

-- Stations
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 7),
  name TEXT NOT NULL,
  tagline TEXT,
  activity_description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'form'
    CHECK (activity_type IN ('form', 'image', 'both')),
  form_schema JSONB DEFAULT '[]'::jsonb,
  map_x FLOAT,
  map_y FLOAT,
  point_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES public.stations(id),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  form_data JSONB,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  UNIQUE(team_id, station_id)
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.profiles(id),
  from_team_id UUID REFERENCES public.teams(id),
  to_team_id UUID NOT NULL REFERENCES public.teams(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL
    CHECK (type IN ('reward', 'spend', 'transfer')),
  note TEXT,
  qr_session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR sessions
CREATE TABLE public.qr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  initiator_id UUID NOT NULL REFERENCES public.profiles(id),
  initiator_role TEXT NOT NULL,
  preset_amount INTEGER,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id)
);

-- Location pings
CREATE TABLE public.location_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  lat FLOAT8 NOT NULL,
  lng FLOAT8 NOT NULL,
  pinged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('case_study', 'innovation_card')),
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  station_number INTEGER,
  sort_order INTEGER DEFAULT 0
);

-- Indexes for performance (~100 concurrent users)
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_submissions_team ON public.submissions(team_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_transactions_to_team ON public.transactions(to_team_id);
CREATE INDEX idx_transactions_from_team ON public.transactions(from_team_id);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX idx_qr_sessions_token ON public.qr_sessions(token);
CREATE INDEX idx_location_pings_user ON public.location_pings(user_id, pinged_at DESC);
CREATE INDEX idx_location_pings_team ON public.location_pings(team_id, pinged_at DESC);

-- QR token on profile insert
CREATE OR REPLACE FUNCTION generate_qr_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_token IS NULL THEN
    NEW.qr_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_create
BEFORE INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_qr_token();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Participant'),
    'participant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Team balance trigger
CREATE OR REPLACE FUNCTION update_team_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams SET balance = balance + NEW.amount WHERE id = NEW.to_team_id;
  IF NEW.from_team_id IS NOT NULL AND NEW.type = 'transfer' THEN
    UPDATE teams SET balance = balance - NEW.amount WHERE id = NEW.from_team_id;
  END IF;
  IF NEW.from_team_id IS NOT NULL AND NEW.type = 'spend' THEN
    UPDATE teams SET balance = balance - NEW.amount WHERE id = NEW.from_team_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION update_team_balance();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Helper: is crew or admin
CREATE OR REPLACE FUNCTION public.is_crew_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND app_role IN ('crew', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id OR public.is_crew_or_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);

-- teams policies
CREATE POLICY teams_select ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY teams_insert ON teams FOR INSERT TO authenticated WITH CHECK (ceo_id = auth.uid());
CREATE POLICY teams_update_ceo ON teams FOR UPDATE USING (ceo_id = auth.uid() OR public.is_crew_or_admin());

-- team_members policies
CREATE POLICY team_members_select ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY team_members_insert ON team_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- stations policies
CREATE POLICY stations_select ON stations FOR SELECT TO authenticated USING (true);

-- submissions policies
CREATE POLICY submissions_select_own ON submissions FOR SELECT USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR public.is_crew_or_admin()
);
CREATE POLICY submissions_insert_own ON submissions FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY submissions_update_own ON submissions FOR UPDATE USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR public.is_crew_or_admin()
);

-- transactions policies
CREATE POLICY transactions_select ON transactions FOR SELECT USING (
  to_team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR from_team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  OR public.is_crew_or_admin()
);

-- qr_sessions policies
CREATE POLICY qr_sessions_select_initiator ON qr_sessions FOR SELECT USING (initiator_id = auth.uid() OR public.is_crew_or_admin());
CREATE POLICY qr_sessions_insert ON qr_sessions FOR INSERT WITH CHECK (initiator_id = auth.uid());

-- location_pings policies
CREATE POLICY location_pings_insert ON location_pings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY location_pings_select ON location_pings FOR SELECT USING (user_id = auth.uid() OR public.is_crew_or_admin());

-- content policies
CREATE POLICY content_select ON content FOR SELECT TO authenticated USING (true);

-- Seed stations
INSERT INTO stations (number, name, tagline, activity_description, activity_type, map_x, map_y, point_reward, form_schema) VALUES
(1, 'Pos 1 — Emphatize', 'Understand the problem deeply', 'Complete Team Building and Case Study activities. Your CEO submits a summary of your team''s empathy findings.', 'both', 68.0, 72.0, 100, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb),
(2, 'Pos 2 — Define', 'Frame the right problem', 'Play the Silent Speaking Game to align on your problem statement.', 'form', 72.0, 50.0, 100, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb),
(3, 'Pos 3 — Ideate', 'Generate bold ideas', 'Study your Innovation Card and brainstorm solutions. Document your top 3 ideas.', 'both', 78.0, 32.0, 100, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb),
(4, 'Pos 4 — Prototype', 'Build your solution', 'Create a prototype of your chosen solution. Document and photograph it.', 'both', 42.0, 28.0, 100, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb),
(5, 'Pos 5 — Market Test', 'Test with real feedback', 'Conduct the Feedback Grid exercise. Record what you learned.', 'form', 32.0, 42.0, 100, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb),
(6, 'Pos 6 — Reflection', 'What did we learn?', 'Photo session, reflection, and sharing session as a team.', 'image', 28.0, 62.0, 100, '[]'::jsonb),
(7, 'Pos 7 — Future Innovation', 'Your vision for the future', 'Document your Future Innovation plan. This is your final submission.', 'form', 42.0, 78.0, 150, '[{"name":"summary","label":"Describe your work at this station","type":"textarea","required":true}]'::jsonb);

-- Seed content
INSERT INTO content (type, company, title, body, station_number, sort_order) VALUES
('case_study', 'Netflix', 'Netflix — From DVD to Streaming Giant', 'Netflix pivoted from DVD rentals to streaming, investing heavily in original content and data-driven recommendations. Their empathy for viewer habits reshaped entertainment.', 1, 1),
('case_study', 'OpenAI', 'OpenAI — Democratizing AI', 'OpenAI started as a research lab with a mission to ensure AGI benefits humanity. ChatGPT brought AI to hundreds of millions of users through accessible design.', 1, 2),
('innovation_card', 'Tesla', 'Tesla Supercharger Network', 'Tesla built proprietary charging infrastructure to remove range anxiety — a ecosystem play that competitors struggled to replicate quickly.', 3, 3),
('innovation_card', 'Netflix', 'Netflix Social Media Marketing', 'Netflix uses hyper-targeted social campaigns and meme culture to create buzz without traditional ad spend — meeting audiences where they are.', 3, 4),
('innovation_card', 'Uniqlo', 'Uniqlo Designer Collaborations', 'Uniqlo partners with designers for limited collections, blending affordability with exclusivity and driving foot traffic.', 3, 5);

-- Storage bucket (run separately in dashboard or):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true);
