import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const profile = await getProfile(user.id);
  if (!profile) redirect('/auth/login');

  if (!profile.onboarding_complete) redirect('/onboarding');

  if (profile.app_role === 'admin') redirect('/admin');
  if (profile.app_role === 'crew') redirect('/crew');

  redirect('/home');
}
