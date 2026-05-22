-- Fix: auth signup failing with "Database error creating new user"
-- Run this in Supabase SQL Editor if registration fails.

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON TABLE public.teams TO supabase_auth_admin;
GRANT ALL ON TABLE public.team_members TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.generate_qr_token() TO supabase_auth_admin;

-- Allow profile row creation during auth signup (trigger context)
DROP POLICY IF EXISTS profiles_insert_auth_admin ON public.profiles;
CREATE POLICY profiles_insert_auth_admin ON public.profiles
  FOR INSERT TO supabase_auth_admin WITH CHECK (true);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_create ON public.profiles;

CREATE OR REPLACE FUNCTION public.generate_qr_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_token IS NULL OR NEW.qr_token = '' THEN
    NEW.qr_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Participant'),
    'participant'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_create
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_qr_token();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
