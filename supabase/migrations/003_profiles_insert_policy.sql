-- Fallback: let authenticated users create their own profile if auth trigger missed
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
